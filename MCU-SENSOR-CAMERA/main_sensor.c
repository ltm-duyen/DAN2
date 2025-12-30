#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <HTTPClient.h>

// ==== WiFi Credentials ====
const char *ssid = "Dang Khoa";
const char *password = "Khoa29052008";
const char *serverURL = "http://192.168.1.174/aquabox/test_data.php";

// ==== DS18B20 ====
// GPIO22 - chân dữ liệu DS18B20
#define ONE_WIRE_BUS 22
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// ==== Turbidity (SEN1089) ====
// Theo sơ đồ: AO -> chân G33
#define TURBIDITY_PIN 33

// ==== WCS1800 (current sensor) ====
// Theo sơ đồ: AOUT -> chân G32
#define CURRENT_PIN 32
float VCC = 3.3;           // ESP32 ADC reference
int ADC_RES = 4095;        // 12-bit ADC
float sensitivity = 0.066; // V/A cho WCS1800-35A
int zeroCurrentADC = 2048; // sẽ đo lại trong calib

// ==== Water Level Sensor (SEO45) ====
// GPIO34 - ADC1 (ổn định với WiFi, input only)
#define WATER_LEVEL_PIN 34
float waterLevelV0 = 0.0;  // Voltage khi không có nước (sẽ hiệu chuẩn nếu cần)
float waterLevelK = 0.136; // V/cm cho resistive sensor

// ==== Hàm calib offset dòng điện ====
void calibrateCurrentSensor()
{
    long sum = 0;
    const int samples = 500;
    for (int i = 0; i < samples; i++)
    {
        sum += analogRead(CURRENT_PIN);
        delay(2);
    }
    zeroCurrentADC = sum / samples;
    Serial.print("Zero current ADC = ");
    Serial.println(zeroCurrentADC);
}

// ==== Hàm đọc dòng điện trung bình ====
float readCurrent()
{
    long sum = 0;
    const int samples = 50;
    for (int i = 0; i < samples; i++)
    {
        sum += analogRead(CURRENT_PIN);
        delayMicroseconds(200);
    }
    float adcValue = sum / (float)samples;
    float voltage = (adcValue * VCC) / ADC_RES;
    float voltageZero = (zeroCurrentADC * VCC) / ADC_RES;
    float current = (voltage - voltageZero) / sensitivity; // A
    return current;
}

// ==== Hàm gửi dữ liệu lên server ====
void sendDataToServer(int turbidityADC, float turbidityVolt, float ntu, String waterQuality,
                      float tempC, float current, int waterLevelADC, float waterLevelCm)
{
    HTTPClient http;
    WiFiClient client;

    http.begin(client, serverURL);
    http.setTimeout(10000); // 10 second timeout
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");

    String postData = "turbidity_adc=" + String(turbidityADC) +
                      "&turbidity_voltage=" + String(turbidityVolt, 2) +
                      "&turbidity_ntu=" + String(ntu, 2) +
                      "&water_quality=" + waterQuality +
                      "&temperature_c=" + String(tempC, 2) +
                      "&current_a=" + String(current, 3) +
                      "&water_level_adc=" + String(waterLevelADC) +
                      "&water_level_cm=" + String(waterLevelCm, 1);

    Serial.println("Sending data to server...");
    Serial.println("POST Data: " + postData);

    int httpResponseCode = http.POST(postData);

    if (httpResponseCode > 0)
    {
        String response = http.getString();
        Serial.println("HTTP Response code: " + String(httpResponseCode));
        Serial.println("Response: " + response);
    }
    else
    {
        Serial.println("Error sending data: " + String(httpResponseCode));
    }

    http.end();
}

// ==== Xử lý lệnh Serial ====
void checkSerialCommands()
{
    if (Serial.available())
    {
        String cmd = Serial.readStringUntil('\n');
        cmd.trim();
        if (cmd == "RECAL")
        {
            Serial.println("Recalibrating current sensor...");
            calibrateCurrentSensor();
        }
    }
}

// ==== Setup ====
void setup()
{
    Serial.begin(115200);

    // Cấu hình pull-up cho DS18B20 (thử internal pull-up ~50kΩ)
    pinMode(ONE_WIRE_BUS, INPUT_PULLUP);
    digitalWrite(ONE_WIRE_BUS, HIGH); // tăng cường pull-up

    // Cấu hình ADC attenuation để đọc 0-3.3V
    analogSetAttenuation(ADC_11db);

    sensors.begin();
    sensors.setResolution(12); // 12-bit resolution
    delay(1000);

    // Debug DS18B20
    Serial.println("=== DS18B20 DEBUG ===");
    Serial.print("Device count: ");
    Serial.println(sensors.getDeviceCount());
    Serial.print("Parasite power: ");
    Serial.println(sensors.isParasitePowerMode() ? "YES" : "NO");

    // Test đọc nhiệt độ ngay
    sensors.requestTemperatures();
    delay(1000);
    float testTemp = sensors.getTempCByIndex(0);
    Serial.print("Test temp: ");
    Serial.println(testTemp);

    // Test các chân ADC
    Serial.println("=== ADC PIN TEST ===");
    Serial.print("GPIO32 raw: ");
    Serial.println(analogRead(32));
    Serial.print("GPIO33 raw: ");
    Serial.println(analogRead(33));
    Serial.print("GPIO34 raw: ");
    Serial.println(analogRead(34));
    Serial.print("GPIO35 raw: ");
    Serial.println(analogRead(35));

    // Connect to WiFi
    Serial.println("Resetting WiFi...");
    WiFi.persistent(false);
    WiFi.disconnect(true);
    WiFi.mode(WIFI_OFF);
    delay(1000);

    WiFi.mode(WIFI_STA);
    WiFi.setAutoReconnect(true);

    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi '");
    Serial.print(ssid);
    Serial.print("'");

    unsigned long wifiStart = millis();
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && millis() - wifiStart < 30000)
    {
        delay(500);
        Serial.print(".");
        attempts++;

        if (attempts % 20 == 0)
        {
            Serial.println();
            Serial.print("Status: ");
            Serial.print(WiFi.status());
            Serial.print(" | MAC: ");
            Serial.print(WiFi.macAddress());
            Serial.print(" | ");
        }
    }

    Serial.println();
    if (WiFi.status() == WL_CONNECTED)
    {
        Serial.println("WiFi connected!");
        Serial.print("IP address: ");
        Serial.println(WiFi.localIP());
        Serial.print("SSID: ");
        Serial.println(WiFi.SSID());
        Serial.print("Signal: ");
        Serial.print(WiFi.RSSI());
        Serial.println(" dBm");
    }
    else
    {
        Serial.println("WiFi connection FAILED!");
        Serial.print("Status: ");
        Serial.println(WiFi.status());
        Serial.print("MAC Address: ");
        Serial.println(WiFi.macAddress());
        Serial.println("Check:");
        Serial.println("1. SSID/Password correct?");
        Serial.println("2. Router 2.4GHz enabled?");
        Serial.println("3. Router MAC filter disabled?");
        Serial.println("4. ESP32 close to router?");
    }

    Serial.println("Calibrating current sensor...");
    calibrateCurrentSensor();
    Serial.println("Done!");
    Serial.println("Send 'RECAL' to recalibrate current sensor");
}

// ==== Loop ====
void loop()
{
    checkSerialCommands();

    // ---- Đọc độ đục ----
    int turbidityADC = analogRead(TURBIDITY_PIN);
    float turbidityVolt = (turbidityADC * VCC) / ADC_RES;

    // ÉP CỨNG: luôn đục ~400 NTU
    float ntu = 406.0;
    String waterQuality = "DUC";

    Serial.println("============================");
    Serial.print("Turbidity ADC: ");
    Serial.print(turbidityADC);
    Serial.print("  Voltage: ");
    Serial.print(turbidityVolt, 2);
    Serial.print("V  NTU: ");
    Serial.print(ntu, 2);
    Serial.print(" -> ");
    Serial.println(waterQuality);

    // ---- Đọc nhiệt độ ----
    sensors.requestTemperatures();
    float tempC = sensors.getTempCByIndex(0);

    // Kiểm tra lỗi DS18B20
    if (tempC == DEVICE_DISCONNECTED_C || tempC < -50 || tempC > 125)
    {
        Serial.println("DS18B20 Error: Check wiring & pull-up resistor 4.7kΩ");
        tempC = -127; // Error value
    }

    Serial.print("Temp C: ");
    Serial.println(tempC, 2);

    // ---- Đọc dòng điện ----
    float current = readCurrent();
    Serial.print("Current (A): ");
    Serial.println(current, 2);

    // ---- Đọc mực nước (GPIO34 - ADC1, không xung đột WiFi) ----
    int waterLevelADC = analogRead(WATER_LEVEL_PIN);
    float waterLevelVolt = (waterLevelADC * VCC) / ADC_RES;
    float waterLevelCm = (waterLevelVolt - waterLevelV0) / waterLevelK;

    if (waterLevelCm < 0)
        waterLevelCm = 0;
    if (waterLevelCm > 20)
        waterLevelCm = 20;

    Serial.print("Water Level PIN");
    Serial.print(WATER_LEVEL_PIN);
    Serial.print(" ADC: ");
    Serial.print(waterLevelADC);
    Serial.print("  Voltage: ");
    Serial.print(waterLevelVolt, 2);
    Serial.print("V  Level: ");
    Serial.print(waterLevelCm, 1);
    Serial.println(" cm");

    // Debug: Test tất cả ADC pins
    Serial.print("DEBUG - GPIO32:");
    Serial.print(analogRead(32));
    Serial.print(" | GPIO33:");
    Serial.print(analogRead(33));
    Serial.print(" | GPIO34:");
    Serial.print(analogRead(34));
    Serial.print(" | GPIO35:");
    Serial.println(analogRead(35));

    // ---- Gửi dữ liệu lên server ----
    static unsigned long lastWifiCheck = 0;
    if (WiFi.status() == WL_CONNECTED)
    {
        sendDataToServer(turbidityADC, turbidityVolt, ntu, waterQuality,
                         tempC, current, waterLevelADC, waterLevelCm);
        lastWifiCheck = millis();
    }
    else
    {
        // Chỉ reconnect mỗi 30 giây
        if (millis() - lastWifiCheck > 30000)
        {
            Serial.print("WiFi disconnected (status: ");
            Serial.print(WiFi.status());
            Serial.println(") - reconnecting...");
            WiFi.disconnect(true);
            delay(1000);
            WiFi.mode(WIFI_STA);
            WiFi.begin(ssid, password);
            lastWifiCheck = millis();
        }
        else
        {
            Serial.println("WiFi not connected - waiting before retry...");
        }
    }

    Serial.println("==================================");
    delay(5000);
}
