import React from "react";
import { Row, Col } from "reactstrap";

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
      // Dữ liệu cảm biến (sẽ được cập nhật từ API thực tế)
      sensors: {
        temperature: { value: 26.5, status: 'normal', unit: '°C' },
        pH: { value: 5.5, status: 'danger', unit: '' },
        turbidity: { value: 15.2, status: 'warning', unit: 'NTU' },
        oxygen: { value: 4.2, status: 'warning', unit: 'mg/L' },
        waterLevel: { value: 85, status: 'normal', unit: '%' }
      },

      // Trạng thái thiết bị
      devices: [
        { id: 1, name: 'Máy bơm nước', type: 'pump', isOn: true },
        { id: 2, name: 'Máy sục khí', type: 'aerator', isOn: false },
        { id: 3, name: 'Đèn chiếu sáng', type: 'light', isOn: true },
        { id: 4, name: 'Bộ cho ăn tự động', type: 'feeder', isOn: true, lastFeed: '14:30' }
      ],

      // Cảnh báo
      alerts: [
        {
          type: 'danger',
          title: 'pH nước quá thấp',
          message: 'pH hiện tại là 5.5, cần kiểm tra và điều chỉnh chất lượng nước',
          timestamp: new Date().getTime()
        },
        {
          type: 'warning',
          title: 'Oxy hòa tan thấp',
          message: 'Nồng độ oxy 4.2 mg/L, nên bật máy sục khí',
          timestamp: new Date().getTime() - 300000
        }
      ],

      // Trạng thái feeding
      isFeeding: false
    };
  }

  // Cập nhật dữ liệu cảm biến (mô phỏng real-time)
  componentDidMount() {
    this.sensorInterval = setInterval(() => {
      this.updateSensorData();
    }, 5000); // Cập nhật mỗi 5 giây
  }

  componentWillUnmount() {
    if (this.sensorInterval) {
      clearInterval(this.sensorInterval);
    }
  }

  updateSensorData = () => {
    this.setState(prevState => ({
      sensors: {
        ...prevState.sensors,
        temperature: {
          ...prevState.sensors.temperature,
          value: (25 + Math.random() * 4).toFixed(1)
        },
        pH: {
          ...prevState.sensors.pH,
          value: (6.5 + (Math.random() - 0.5) * 2).toFixed(1)
        },
        turbidity: {
          ...prevState.sensors.turbidity,
          value: (10 + Math.random() * 15).toFixed(1)
        },
        oxygen: {
          ...prevState.sensors.oxygen,
          value: (4 + Math.random() * 3).toFixed(1)
        },
        waterLevel: {
          ...prevState.sensors.waterLevel,
          value: Math.floor(80 + Math.random() * 20)
        }
      }
    }));
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

  // Xử lý cho ăn
  handleFeedFish = () => {
    this.setState({ isFeeding: true });

    // Cập nhật thời gian cho ăn và tắt trạng thái feeding sau 3 giây
    setTimeout(() => {
      const now = new Date();
      const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

      this.setState(prevState => ({
        isFeeding: false,
        devices: prevState.devices.map(device =>
          device.type === 'feeder'
            ? { ...device, lastFeed: timeString }
            : device
        )
      }));
    }, 3000);
  }

  // Xử lý bật/tắt đèn
  handleToggleLight = () => {
    this.setState(prevState => ({
      devices: prevState.devices.map(device =>
        device.type === 'light'
          ? { ...device, isOn: !device.isOn }
          : device
      )
    }));
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

  render() {
    const { sensors, devices, alerts, isFeeding } = this.state;
    const lightDevice = devices.find(d => d.type === 'light');

    // Tạo dữ liệu mẫu cho biểu đồ 24h
    const tempData = Array.from({ length: 24 }, () => 25 + Math.random() * 4);
    const pHData = Array.from({ length: 24 }, () => 6.5 + (Math.random() - 0.5) * 2);
    const turbidityData = Array.from({ length: 24 }, () => 10 + Math.random() * 15);

    return (
      <div className={s.root}>
        <h1 className="page-title">
          🐠 Dashboard Quản lý Hồ Cá &nbsp;
          <small>
            <small>Hệ thống IoT thông minh</small>
          </small>
        </h1>

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
          <Col lg={2} md={4} sm={6} xs={12} className="mb-3">
            <SensorCard
              icon="🌡️"
              title="Nhiệt độ nước"
              value={sensors.temperature.value}
              unit={sensors.temperature.unit}
              status={sensors.temperature.status}
              description="Nhiệt độ lý tưởng: 25-28°C"
            />
          </Col>

          <Col lg={2} md={4} sm={6} xs={12} className="mb-3">
            <SensorCard
              icon="💧"
              title="Độ pH"
              value={sensors.pH.value}
              unit={sensors.pH.unit}
              status={sensors.pH.status}
              description="pH lý tưởng: 6.5-7.5"
            />
          </Col>

          <Col lg={2} md={4} sm={6} xs={12} className="mb-3">
            <SensorCard
              icon="🌫️"
              title="Độ đục nước"
              value={sensors.turbidity.value}
              unit={sensors.turbidity.unit}
              status={sensors.turbidity.status}
              description="Thấp hơn tốt hơn"
            />
          </Col>

          <Col lg={2} md={4} sm={6} xs={12} className="mb-3">
            <SensorCard
              icon="🫧"
              title="Oxy hòa tan"
              value={sensors.oxygen.value}
              unit={sensors.oxygen.unit}
              status={sensors.oxygen.status}
              description="Tối thiểu: 5 mg/L"
            />
          </Col>

          <Col lg={2} md={4} sm={6} xs={12} className="mb-3">
            <SensorCard
              icon="📏"
              title="Mực nước"
              value={sensors.waterLevel.value}
              unit={sensors.waterLevel.unit}
              status={sensors.waterLevel.status}
              description="Mức an toàn: 80-95%"
            />
          </Col>

          <Col lg={2} md={4} sm={6} xs={12} className="mb-3">
            <QuickActions
              onToggleLight={this.handleToggleLight}
              onFeedFish={this.handleFeedFish}
              onResetAlerts={this.handleResetAlerts}
              lightStatus={lightDevice?.isOn}
              isFeeding={isFeeding}
            />
          </Col>
        </Row>

        {/* Phần 2: Trạng thái thiết bị và Biểu đồ */}
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

        {/* Phần 3: Biểu đồ nhanh 24h */}
        <Row className="mb-4">
          <Col lg={12}>
            <h5 className="mb-3">
              <i className="fa fa-line-chart mr-2"></i>
              Biểu đồ theo dõi 24h qua
            </h5>
          </Col>
        </Row>

        <Row>
          <Col lg={4} md={12} className="mb-3">
            <MiniChart
              title="Nhiệt độ nước"
              data={tempData}
              color="#dc3545"
              unit="°C"
            />
          </Col>

          <Col lg={4} md={12} className="mb-3">
            <MiniChart
              title="Độ pH"
              data={pHData}
              color="#007bff"
              unit=""
            />
          </Col>

          <Col lg={4} md={12} className="mb-3">
            <MiniChart
              title="Độ đục nước"
              data={turbidityData}
              color="#ffc107"
              unit=" NTU"
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default Dashboard;
