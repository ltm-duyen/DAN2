#include <WiFi.h>
#include "esp_camera.h"

// ==== WiFi (Windows Mobile Hotspot) ====
const char *WIFI_SSID = "LAPTOP-9K10U1O4 0801";
const char *WIFI_PASS = "K74{52r2";

// ==== Server PC (trên hotspot Windows) ====
const char *HOST = "192.168.137.1"; // ipconfig trên PC -> IPv4 của hotspot
const int PORT = 80;
const char *PATH_UPLOAD = "/aquabox/upload_image.php";
const char *PATH_PING = "/aquabox/ping.php";
const char *PATH_ECHO = "/aquabox/post_echo.php";

const uint32_t SHOT_EVERY_MS = 5000; // 5s

// ==== AI-Thinker pins ====
#define PWDN_GPIO_NUM 32
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM 0
#define SIOD_GPIO_NUM 26
#define SIOC_GPIO_NUM 27
#define Y9_GPIO_NUM 35
#define Y8_GPIO_NUM 34
#define Y7_GPIO_NUM 39
#define Y6_GPIO_NUM 36
#define Y5_GPIO_NUM 21
#define Y4_GPIO_NUM 19
#define Y3_GPIO_NUM 18
#define Y2_GPIO_NUM 5
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM 23
#define PCLK_GPIO_NUM 22

bool initCam()
{
    camera_config_t c = {};
    c.ledc_channel = LEDC_CHANNEL_0;
    c.ledc_timer = LEDC_TIMER_0;

    c.pin_d0 = Y2_GPIO_NUM;
    c.pin_d1 = Y3_GPIO_NUM;
    c.pin_d2 = Y4_GPIO_NUM;
    c.pin_d3 = Y5_GPIO_NUM;
    c.pin_d4 = Y6_GPIO_NUM;
    c.pin_d5 = Y7_GPIO_NUM;
    c.pin_d6 = Y8_GPIO_NUM;
    c.pin_d7 = Y9_GPIO_NUM;
    c.pin_xclk = XCLK_GPIO_NUM;
    c.pin_pclk = PCLK_GPIO_NUM;
    c.pin_vsync = VSYNC_GPIO_NUM;
    c.pin_href = HREF_GPIO_NUM;
    c.pin_sccb_sda = SIOD_GPIO_NUM;
    c.pin_sccb_scl = SIOC_GPIO_NUM;
    c.pin_pwdn = PWDN_GPIO_NUM;
    c.pin_reset = RESET_GPIO_NUM;

    c.xclk_freq_hz = 10000000; // <= SỬA: 10 MHz
    c.pixel_format = PIXFORMAT_JPEG;

    if (psramFound())
    {
        c.frame_size = FRAMESIZE_SVGA; // 800x600
        c.jpeg_quality = 12;
        c.fb_count = 2;
        c.fb_location = CAMERA_FB_IN_PSRAM;
        c.grab_mode = CAMERA_GRAB_LATEST;
    }
    else
    {
        c.frame_size = FRAMESIZE_VGA; // 640x480
        c.jpeg_quality = 20;
        c.fb_count = 1;
        c.fb_location = CAMERA_FB_IN_DRAM;
        c.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
    }

    auto err = esp_camera_init(&c);
    if (err != ESP_OK)
    {
        Serial.printf("Camera init ERR=0x%x\n", err);
        return false;
    }
    sensor_t *s = esp_camera_sensor_get();
    if (s)
    {
        s->set_vflip(s, 1);
        s->set_hmirror(s, 0);
    }
    return true;
}

String httpGet(const char *path)
{
    WiFiClient cli;
    String resp;
    Serial.printf("[GET] http://%s:%d%s\n", HOST, PORT, path);
    if (!cli.connect(HOST, PORT))
    {
        Serial.println("connect fail");
        return "";
    }
    
    cli.print(String("GET ") + path + " HTTP/1.1\r\nHost: " + HOST +
              "\r\nConnection: close\r\n\r\n");
    unsigned long t0 = millis();
    while (cli.connected() && !cli.available())
    {
        if (millis() - t0 > 8000)
        {
            Serial.println("GET timeout");
            cli.stop();
            return "";
        }
        delay(10);
    }
    while (cli.available())
        resp += cli.readString();
    Serial.println(resp);
    cli.stop();
    return resp;
}

String httpPostSmall(const char *path, const char *body)
{
    WiFiClient cli;
    String resp;
    Serial.printf("[POST] http://%s:%d%s (len=%u)\n", HOST, PORT, path, (unsigned)strlen(body));
    if (!cli.connect(HOST, PORT))
    {
        Serial.println("connect fail");
        return "";
    }
    cli.print(String("POST ") + path + " HTTP/1.1\r\nHost: " + HOST +
              "\r\nContent-Type: text/plain\r\nContent-Length: " + String(strlen(body)) +
              "\r\nConnection: close\r\n\r\n");
    cli.print(body);
    unsigned long t0 = millis();
    while (cli.connected() && !cli.available())
    {
        if (millis() - t0 > 8000)
        {
            Serial.println("POST timeout");
            cli.stop();
            return "";
        }
        delay(10);
    }
    while (cli.available())
        resp += cli.readString();
    Serial.println(resp);
    cli.stop();
    return resp;
}

bool uploadJpeg(const uint8_t *jpg, size_t len)
{
    WiFiClient client;
    Serial.printf("[UPLOAD] -> http://%s:%d%s  (%u bytes)\n", HOST, PORT, PATH_UPLOAD, (unsigned)len);
    if (!client.connect(HOST, PORT))
    {
        Serial.println("connect fail");
        return false;
    }

    const char *boundary = "----esp32camBoundary";
    auto field = [&](const String &k, const String &v)
    {
        String p = "--";
        p += boundary;
        p += "\r\n";
        p += "Content-Disposition: form-data; name=\"" + k + "\"\r\n\r\n" + v + "\r\n";
        return p;
    };

    String body = field("device_id", "esp32cam-01");
    String fileHead = "--" + String(boundary) + "\r\n"
                                                "Content-Disposition: form-data; name=\"file\"; filename=\"frame.jpg\"\r\n"
                                                "Content-Type: image/jpeg\r\n\r\n";
    String tail = "\r\n--" + String(boundary) + "--\r\n";
    size_t contentLen = body.length() + fileHead.length() + len + tail.length();

    client.print(String("POST ") + PATH_UPLOAD + " HTTP/1.1\r\n");
    client.print(String("Host: ") + HOST + "\r\n");
    client.print("Content-Type: multipart/form-data; boundary=" + String(boundary) + "\r\n");
    client.print("Connection: close\r\n");
    client.print("Content-Length: " + String(contentLen) + "\r\n\r\n");

    client.print(body);
    client.print(fileHead);

    const size_t CHUNK = 1460;
    size_t sent = 0;
    while (sent < len)
    {
        size_t n = min(CHUNK, len - sent);
        client.write(jpg + sent, n);
        sent += n;
        delay(1);
    }
    client.print(tail);

    String resp;
    unsigned long t0 = millis();
    while (client.connected() && !client.available())
    {
        if (millis() - t0 > 15000)
        {
            Serial.println("upload timeout");
            client.stop();
            return false;
        }
        delay(10);
    }
    while (client.available())
        resp += client.readString();

    Serial.println("=== HTTP RESPONSE ===");
    Serial.println(resp);
    Serial.println("=====================");
    return resp.indexOf("\"success\":true") != -1;
}

void setup()
{
    Serial.begin(115200);
    delay(200);
    if (!initCam())
    {
        Serial.println("Camera init FAIL");
        while (1)
            delay(1000);
    }

    WiFi.begin(WIFI_SSID, WIFI_PASS);
    Serial.print("WiFi connecting");
    for (int i = 0; i < 80 && WiFi.status() != WL_CONNECTED; ++i)
    {
        delay(250);
        Serial.print(".");
    }
    Serial.println();
    Serial.printf("SSID: %s\n", WiFi.SSID().c_str());
    Serial.printf("IP:   %s\n", WiFi.localIP().toString().c_str());

    // Kiểm tra đường đi:
    httpGet(PATH_PING);                // phải thấy "pong"
    httpPostSmall(PATH_ECHO, "hello"); // phải thấy JSON echo lại
}

void loop()
{
    static uint32_t last = 0;
    uint32_t now = millis();
    if (now - last >= SHOT_EVERY_MS)
    {
        last = now;
        camera_fb_t *fb = esp_camera_fb_get();
        if (!fb)
        {
            Serial.println("CAPTURE FAIL");
            return;
        }
        bool ok = uploadJpeg(fb->buf, fb->len);
        Serial.println(ok ? "UPLOAD OK" : "UPLOAD FAIL");
        esp_camera_fb_return(fb);
    }
    delay(5);
}
