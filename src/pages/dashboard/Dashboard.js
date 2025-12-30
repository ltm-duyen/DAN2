import React from "react";
import { Row, Col, Badge } from "reactstrap";

import Widget from "../../components/Widget";
import SensorCard from "./components/SensorCard";
import DeviceStatus from "./components/DeviceStatus";
import MiniChart from "./components/MiniChart";
import AlertsPanel from "./components/AlertsPanel";
import QuickActions from "./components/QuickActions";

import s from "./Dashboard.module.scss";

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // API Configuration
      apiBaseUrl: "http://localhost/aquabox/test_data.php",

      // Dữ liệu cảm biến từ API
      sensors: {
        temperature: { value: 0, status: 'normal', unit: '°C' },
        turbidity: { value: 0, status: 'normal', unit: 'NTU' },
        current: { value: 0, status: 'normal', unit: 'A' },
        dissolvedOxygen: { value: 0, status: 'normal', unit: 'mg/L' },
        waterLevel: { value: 0, status: 'normal', unit: 'cm' }
      },

      // Lịch sử dữ liệu cho biểu đồ
      chartData: {
        temperature: [],
        turbidity: [],
        current: [],
        dissolvedOxygen: [],
        waterLevel: []
      },

      // Thông tin chi tiết từ API
      waterQuality: 'UNKNOWN',
      rawData: null,

      // Trạng thái thiết bị
      devices: [
        { id: 1, name: 'Máy bơm nước', type: 'pump', isOn: true },
        { id: 2, name: 'Máy sục khí', type: 'aerator', isOn: false },
        { id: 3, name: 'Đèn chiếu sáng', type: 'light', isOn: true },
        { id: 4, name: 'Bộ cho ăn tự động', type: 'feeder', isOn: true, lastFeed: '14:30' }
      ],

      // Cảnh báo
      alerts: [],

      // Trạng thái
      isFeeding: false,
      isLoading: true,
      lastUpdate: null,
      connectionStatus: 'connecting'
    };
  }

  componentDidMount() {
    console.log('🚀 Dashboard component mounted');
    console.log('🔗 API URL:', this.state.apiBaseUrl);
    
    // Delay nhỏ để đảm bảo component đã render xong
    setTimeout(() => {
      console.log('⏰ Starting initial data fetch...');
      // Fetch dữ liệu lần đầu
      this.fetchLatestData();
      this.fetchAllData();
    }, 1000);

    // Cập nhật dữ liệu mỗi 5 giây
    this.dataInterval = setInterval(() => {
      console.log('🔄 Interval fetch at:', new Date().toLocaleTimeString());
      this.fetchLatestData();
    }, 5000);

    // Fetch lịch sử dữ liệu mỗi 30 giây
    this.chartInterval = setInterval(() => {
      console.log('📊 Chart data fetch at:', new Date().toLocaleTimeString());
      this.fetchAllData();
    }, 30000);
  }

  componentWillUnmount() {
    if (this.dataInterval) {
      clearInterval(this.dataInterval);
    }
    if (this.chartInterval) {
      clearInterval(this.chartInterval);
    }
  }

  // Fetch dữ liệu mới nhất từ API
  fetchLatestData = async () => {
    try {
      console.log('🔄 Fetching data from:', this.state.apiBaseUrl);
      console.log('🕐 Current time:', new Date().toLocaleTimeString());
      
      const response = await fetch(this.state.apiBaseUrl);
      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      console.log('📄 Raw response length:', text.length);
      console.log('📄 First 200 chars:', text.substring(0, 200));

      if (!text.trim()) {
        throw new Error('Empty response from server');
      }

      const result = JSON.parse(text);
      console.log('✅ Parsed JSON successfully');
      console.log('📊 API Response structure:', {
        success: result.success,
        count: result.count,
        dataLength: result.data?.length || 0,
        firstItem: result.data?.[0] || null
      });

      if (result.success && result.data && result.data.length > 0) {
        const latestData = result.data[0];
        console.log('🎯 Latest data:', latestData);
        console.log('🎯 Calling updateSensorsFromAPI with:', latestData);
        
        this.updateSensorsFromAPI(latestData);
        this.setState({
          isLoading: false,
          connectionStatus: 'connected',
          lastUpdate: new Date(latestData.created_at || Date.now()),
          waterQuality: latestData.water_quality || 'UNKNOWN',
          rawData: latestData
        });
        console.log('✅ State updated successfully');
      } else {
        console.warn('⚠️ No data received from API:', result);
        this.setState({
          isLoading: false,
          connectionStatus: 'error'
        });
      }
    } catch (error) {
      console.error('❌ Error fetching latest data:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });
      this.setState({
        connectionStatus: 'error',
        isLoading: false
      });
    }
  }

  // Fetch tất cả dữ liệu cho biểu đồ
  fetchAllData = async () => {
    try {
      const response = await fetch(this.state.apiBaseUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      if (!text.trim()) {
        throw new Error('Empty response from server');
      }

      const result = JSON.parse(text);

      if (result.success && result.data && result.data.length > 0) {
        this.updateChartData(result.data);
      }
    } catch (error) {
      console.error('Error fetching all data:', error);
    }
  }

  // Cập nhật dữ liệu cảm biến từ API response
  updateSensorsFromAPI = (data) => {
    console.log('🔧 updateSensorsFromAPI called with:', data);

    // Đảm bảo có giá trị mặc định nếu API không trả về
    const temperatureValue = data.temperature_c !== undefined ? parseFloat(data.temperature_c) : 0;
    const turbidityValue = data.turbidity_ntu !== undefined ? parseFloat(data.turbidity_ntu) : 0;
    const currentValue = data.current_a !== undefined ? parseFloat(data.current_a) : 0;
    const dissolvedOxygenValue = data.dissolved_oxygen !== undefined ? parseFloat(data.dissolved_oxygen) : 0;
    const waterLevelValue = data.water_level_cm !== undefined ? parseFloat(data.water_level_cm) : 0;

    console.log('🔢 Parsed values:', {
      temperature: temperatureValue,
      turbidity: turbidityValue,
      current: currentValue,
      dissolvedOxygen: dissolvedOxygenValue,
      waterLevel: waterLevelValue
    });

    const sensors = {
      temperature: {
        value: temperatureValue.toFixed(1),
        status: this.getTemperatureStatus(temperatureValue),
        unit: '°C'
      },
      turbidity: {
        value: turbidityValue.toFixed(1),
        status: this.getTurbidityStatus(turbidityValue),
        unit: 'NTU'
      },
      current: {
        value: currentValue.toFixed(3),
        status: this.getCurrentStatus(currentValue),
        unit: 'A'
      },
      dissolvedOxygen: {
        value: dissolvedOxygenValue.toFixed(2),
        status: this.getDissolvedOxygenStatus(dissolvedOxygenValue),
        unit: 'mg/L'
      },
      waterLevel: {
        value: waterLevelValue.toFixed(2),
        status: this.getWaterLevelStatus(waterLevelValue),
        unit: 'cm'
      }
    };

    console.log('🎛️ Processed sensors:', sensors);

    // Tạo cảnh báo nếu cần
    this.checkAndCreateAlerts(sensors, data);

    console.log('💾 Setting state with new sensors...');
    this.setState({ sensors }, () => {
      console.log('✅ State updated! New sensors in state:', this.state.sensors);
    });
  }

  // Cập nhật dữ liệu biểu đồ
  updateChartData = (dataArray) => {
    const chartData = {
      temperature: dataArray.map(item => parseFloat(item.temperature_c)),
      turbidity: dataArray.map(item => parseFloat(item.turbidity_ntu)),
      current: dataArray.map(item => parseFloat(item.current_a)),
      dissolvedOxygen: dataArray.map(item => parseFloat(item.dissolved_oxygen)),
      waterLevel: dataArray.map(item => parseFloat(item.water_level_cm || 0))
    };

    this.setState({ chartData });
  }

  // Xác định trạng thái nhiệt độ
  getTemperatureStatus = (temp) => {
    if (temp < 24 || temp > 30) return 'danger';
    if (temp < 25 || temp > 29) return 'warning';
    return 'normal';
  }

  // Xác định trạng thái độ đục
  getTurbidityStatus = (ntu) => {
    if (ntu > 500) return 'danger';
    if (ntu > 100) return 'warning';
    return 'normal';
  }

  // Xác định trạng thái dòng điện
  getCurrentStatus = (current) => {
    if (current > 1.0) return 'danger';
    if (current > 0.7) return 'warning';
    return 'normal';
  }

  // Xác định trạng thái oxy hòa tan
  getDissolvedOxygenStatus = (do_value) => {
    if (do_value < 5.0) return 'danger';     // Dưới 5mg/L nguy hiểm
    if (do_value < 6.0) return 'warning';    // 5-6mg/L cảnh báo
    if (do_value > 12.0) return 'warning';   // Trên 12mg/L cũng không tốt
    return 'normal';                         // 6-12mg/L bình thường
  }

  // Xác định trạng thái mực nước (cm)
  getWaterLevelStatus = (level_cm) => {
    // Giả định: dưới 5cm rất thấp (danger), 5-10cm cảnh báo, trên 10cm bình thường
    if (level_cm < 5) return 'danger';
    if (level_cm < 10) return 'warning';
    return 'normal';
  }

  // Kiểm tra và tạo cảnh báo
  checkAndCreateAlerts = (sensors, data) => {
    const newAlerts = [];

    // Cảnh báo nhiệt độ
    if (sensors.temperature.status === 'danger') {
      newAlerts.push({
        type: 'danger',
        title: 'Nhiệt độ nước bất thường',
        message: `Nhiệt độ hiện tại ${sensors.temperature.value}°C vượt quá giới hạn an toàn (24-30°C)`,
        timestamp: Date.now()
      });
    }

    // Cảnh báo độ đục
    if (sensors.turbidity.status === 'danger') {
      newAlerts.push({
        type: 'danger',
        title: 'Nước quá đục',
        message: `Độ đục ${sensors.turbidity.value} NTU - Chất lượng nước: ${data.water_quality}`,
        timestamp: Date.now()
      });
    } else if (sensors.turbidity.status === 'warning') {
      newAlerts.push({
        type: 'warning',
        title: 'Nước hơi đục',
        message: `Độ đục ${sensors.turbidity.value} NTU - Chất lượng nước: ${data.water_quality}`,
        timestamp: Date.now()
      });
    }

    // Cảnh báo dòng điện
    if (sensors.current.status === 'danger') {
      newAlerts.push({
        type: 'danger',
        title: 'Dòng điện máy bơm cao',
        message: `Dòng điện ${sensors.current.value}A có thể báo hiệu sự cố máy bơm`,
        timestamp: Date.now()
      });
    }

    // Cảnh báo oxy hòa tan
    if (sensors.dissolvedOxygen.status === 'danger') {
      newAlerts.push({
        type: 'danger',
        title: 'Oxy hòa tan nguy hiểm',
        message: `Oxy hòa tan ${sensors.dissolvedOxygen.value} mg/L quá thấp, cá có thể thiếu oxy`,
        timestamp: Date.now()
      });
    } else if (sensors.dissolvedOxygen.status === 'warning') {
      newAlerts.push({
        type: 'warning',
        title: 'Oxy hòa tan cần chú ý',
        message: `Oxy hòa tan ${sensors.dissolvedOxygen.value} mg/L nằm ngoài khoảng lý tưởng`,
        timestamp: Date.now()
      });
    }

    // Cảnh báo mực nước
    if (sensors.waterLevel.status === 'danger') {
      newAlerts.push({
        type: 'danger',
        title: 'Mực nước quá thấp',
        message: `Mực nước ${sensors.waterLevel.value} cm dưới mức an toàn`,
        timestamp: Date.now()
      });
    } else if (sensors.waterLevel.status === 'warning') {
      newAlerts.push({
        type: 'warning',
        title: 'Mực nước cần chú ý',
        message: `Mực nước ${sensors.waterLevel.value} cm nằm gần ngưỡng thấp`,
        timestamp: Date.now()
      });
    }

    // Cập nhật alerts (chỉ giữ alerts mới, xóa alerts cũ cùng loại)
    this.setState(prevState => {
      const filteredAlerts = prevState.alerts.filter(alert =>
        !newAlerts.some(newAlert => newAlert.title === alert.title)
      );
      return {
        alerts: [...filteredAlerts, ...newAlerts].slice(-5) // Chỉ giữ 5 alerts mới nhất
      };
    });
  }

  // Xử lý bật/tắt thiết bị
  handleToggleDevice = (deviceId) => {
    this.setState(prevState => ({
      devices: prevState.devices.map(device =>
        device.id === deviceId
          ? { ...device, isOn: !device.isOn }
          : device
      )
    }));
  }

  // Xử lý bật/tắt đèn
  handleToggleLight = () => {
    this.handleToggleDevice(3); // Device ID 3 là đèn chiếu sáng
  }

  // Xử lý cho ăn cá
  handleFeedFish = () => {
    this.setState({ isFeeding: true });
    
    // Giả lập quá trình cho ăn (3 giây)
    setTimeout(() => {
      this.setState(prevState => ({
        isFeeding: false,
        devices: prevState.devices.map(device =>
          device.type === 'feeder'
            ? { ...device, lastFeed: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }
            : device
        )
      }));
    }, 3000);
  }

  // Xử lý xóa cảnh báo
  handleDismissAlert = (index) => {
    this.setState(prevState => ({
      alerts: prevState.alerts.filter((_, i) => i !== index)
    }));
  }

  // Xử lý reset tất cả cảnh báo
  handleResetAlerts = () => {
    this.setState({ alerts: [] });
  }

  // Get connection status badge
  getConnectionBadge = () => {
    const { connectionStatus } = this.state;
    const statusConfig = {
      connecting: { color: 'warning', text: 'Đang kết nối...' },
      connected: { color: 'success', text: 'Trực tuyến' },
      error: { color: 'danger', text: 'Mất kết nối' }
    };

    const config = statusConfig[connectionStatus] || statusConfig.error;
    return <Badge color={config.color}>{config.text}</Badge>;
  }

  render() {
    const {
      sensors,
      devices,
      alerts,
      isFeeding,
      chartData,
      waterQuality,
      lastUpdate,
      isLoading,
      connectionStatus,
      rawData
    } = this.state;

    const lightDevice = devices.find(d => d.type === 'light');

    return (
      <div className={s.root}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="page-title mb-0">
            🐠 Dashboard Quản lý Hồ Cá &nbsp;
            <small>
              <small>Hệ thống IoT thông minh</small>
            </small>
          </h1>

          <div className="d-flex align-items-center">
            {this.getConnectionBadge()}
            {lastUpdate && (
              <small className="text-muted ml-3">
                Cập nhật: {lastUpdate.toLocaleTimeString()}
              </small>
            )}
          </div>
        </div>



        {/* Thông tin chất lượng nước */}
        {waterQuality && waterQuality !== 'UNKNOWN' && (
          <Row className="mb-4">
            <Col lg={12}>
              <Widget>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">🌊 Chất lượng nước hiện tại</h6>
                    <h4 className={`mb-0 ${waterQuality.includes('DUC') ? 'text-danger' : 'text-success'}`}>
                      {waterQuality}
                    </h4>
                  </div>
                  <div className="text-right">
                    <small className="text-muted">Đánh giá tự động từ cảm biến độ đục</small>
                  </div>
                </div>
              </Widget>
            </Col>
          </Row>
        )}

        {/* Phần 1: Thông tin cảm biến realtime */}
        <Row className="mb-4">
          <Col lg={12}>
            <h5 className="mb-3">
              <i className="fa fa-tachometer mr-2"></i>
              Thông tin cảm biến thời gian thực
            </h5>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col lg={3} md={6} sm={6} xs={12} className="mb-3">
            <SensorCard
              icon="🌡️"
              title="Nhiệt độ nước"
              value={isLoading ? '...' : sensors.temperature.value}
              unit={sensors.temperature.unit}
              status={sensors.temperature.status}
              description="Nhiệt độ lý tưởng: 24-30°C"
            />
          </Col>

          <Col lg={3} md={6} sm={6} xs={12} className="mb-3">
            <SensorCard
              icon="🌫️"
              title="Độ đục nước"
              value={isLoading ? '...' : sensors.turbidity.value}
              unit={sensors.turbidity.unit}
              status={sensors.turbidity.status}
              description="Thấp hơn tốt hơn"
            />
          </Col>

          <Col lg={3} md={6} sm={6} xs={12} className="mb-3">
            <SensorCard
              icon="⚡"
              title="Dòng điện máy bơm"
              value={isLoading ? '...' : sensors.current.value}
              unit={sensors.current.unit}
              status={sensors.current.status}
              description="Giám sát hoạt động máy bơm"
            />
          </Col>

          <Col lg={3} md={6} sm={6} xs={12} className="mb-3">
            <SensorCard
              icon="🫧"
              title="Oxy hòa tan"
              value={isLoading ? '...' : sensors.dissolvedOxygen.value}
              unit={sensors.dissolvedOxygen.unit}
              status={sensors.dissolvedOxygen.status}
              description="Lý tưởng: 6-12 mg/L"
            />
          </Col>

          <Col lg={3} md={6} sm={6} xs={12} className="mb-3">
            <SensorCard
              icon="💧"
              title="Mực nước"
              value={isLoading ? '...' : sensors.waterLevel.value}
              unit={sensors.waterLevel.unit}
              status={sensors.waterLevel.status}
              description="Đơn vị: cm"
            />
          </Col>
        </Row>

        {/* Quick Actions Row */}
        <Row className="mb-4">
          <Col lg={12} className="mb-3">
            <QuickActions
              onToggleLight={this.handleToggleLight}
              onFeedFish={this.handleFeedFish}
              onResetAlerts={this.handleResetAlerts}
              lightStatus={lightDevice?.isOn}
              isFeeding={isFeeding}
            />
          </Col>
        </Row>

        {/* Phần 2: Trạng thái thiết bị và Cảnh báo */}
        <Row className="mb-4">
          <Col lg={6} className="mb-3">
            <DeviceStatus
              devices={devices}
              onToggleDevice={this.handleToggleDevice}
              onFeedFish={this.handleFeedFish}
            />
          </Col>

          <Col lg={6} className="mb-3">
            <AlertsPanel
              alerts={alerts}
              onDismissAlert={this.handleDismissAlert}
              onResetAlerts={this.handleResetAlerts}
            />
          </Col>
        </Row>

        {/* Phần 3: Biểu đồ nhanh */}
        <Row className="mb-4">
          <Col lg={12}>
            <h5 className="mb-3">
              <i className="fa fa-line-chart mr-2"></i>
              Biểu đồ theo dõi dữ liệu gần đây
            </h5>
          </Col>
        </Row>

        <Row>
          <Col lg={3} md={6} className="mb-3">
            <MiniChart
              title="Nhiệt độ nước"
              data={chartData.temperature.length ? chartData.temperature : [26.5]}
              color="#dc3545"
              unit="°C"
            />
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <MiniChart
              title="Độ đục nước"
              data={chartData.turbidity.length ? chartData.turbidity : [15.2]}
              color="#ffc107"
              unit=" NTU"
            />
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <MiniChart
              title="Dòng điện máy bơm"
              data={chartData.current.length ? chartData.current : [0.5]}
              color="#28a745"
              unit=" A"
            />
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <MiniChart
              title="Oxy hòa tan"
              data={chartData.dissolvedOxygen.length ? chartData.dissolvedOxygen : [7.5]}
              color="#17a2b8"
              unit=" mg/L"
            />
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <MiniChart
              title="Mực nước"
              data={chartData.waterLevel.length ? chartData.waterLevel : [12.0]}
              color="#007bff"
              unit=" cm"
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default Dashboard;
