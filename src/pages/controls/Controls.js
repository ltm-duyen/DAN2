import React from 'react';
import { Row, Col, Card, CardBody, Button, Badge, Switch } from 'reactstrap';
import Widget from '../../components/Widget';
import s from './Controls.module.scss';

class Controls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      devices: [
        {
          id: 1,
          name: 'Máy bơm nước chính',
          type: 'pump',
          isOn: true,
          icon: '🔄',
          description: 'Bơm nước tuần hoàn cho hồ cá',
          powerConsumption: '150W',
          schedule: 'Tự động theo mực nước'
        },
        {
          id: 2,
          name: 'Máy sục khí',
          type: 'aerator',
          isOn: false,
          icon: '💨',
          description: 'Cung cấp oxy cho hồ cá',
          powerConsumption: '85W',
          schedule: '6h-18h hàng ngày'
        },
        {
          id: 3,
          name: 'Đèn LED chiếu sáng',
          type: 'light',
          isOn: true,
          icon: '💡',
          description: 'Chiếu sáng cho hồ cá',
          powerConsumption: '40W',
          schedule: '18h-6h hàng ngày'
        },
        {
          id: 4,
          name: 'Hệ thống lọc nước',
          type: 'filter',
          isOn: true,
          icon: '🌀',
          description: 'Lọc và làm sạch nước hồ',
          powerConsumption: '120W',
          schedule: 'Hoạt động liên tục'
        },
        {
          id: 5,
          name: 'Bộ cho ăn tự động',
          type: 'feeder',
          isOn: true,
          icon: '🍽️',
          description: 'Cho cá ăn tự động theo lịch',
          powerConsumption: '15W',
          schedule: '8h, 12h, 18h hàng ngày',
          lastFeed: '12:30'
        },
        {
          id: 6,
          name: 'Máy sưởi nước',
          type: 'heater',
          isOn: false,
          icon: '🔥',
          description: 'Duy trì nhiệt độ nước ổn định',
          powerConsumption: '200W',
          schedule: 'Tự động khi nhiệt độ < 25°C'
        }
      ],
      totalPowerConsumption: 0
    };
  }

  componentDidMount() {
    this.calculatePowerConsumption();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.devices !== this.state.devices) {
      this.calculatePowerConsumption();
    }
  }

  calculatePowerConsumption = () => {
    const total = this.state.devices.reduce((sum, device) => {
      if (device.isOn) {
        const power = parseInt(device.powerConsumption.replace('W', ''));
        return sum + power;
      }
      return sum;
    }, 0);
    
    this.setState({ totalPowerConsumption: total });
  }

  handleToggleDevice = (deviceId) => {
    this.setState(prevState => ({
      devices: prevState.devices.map(device =>
        device.id === deviceId
          ? { ...device, isOn: !device.isOn }
          : device
      )
    }));
  }

  handleFeedNow = () => {
    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    this.setState(prevState => ({
      devices: prevState.devices.map(device =>
        device.type === 'feeder'
          ? { ...device, lastFeed: timeString }
          : device
      )
    }));
  }

  getDeviceStatusColor = (isOn) => {
    return isOn ? 'success' : 'secondary';
  }

  getDeviceStatusText = (isOn) => {
    return isOn ? 'Đang hoạt động' : 'Tắt';
  }

  render() {
    const { devices, totalPowerConsumption } = this.state;
    const activeDevices = devices.filter(d => d.isOn).length;

    return (
      <div>
        <h1 className="page-title">
          🎛️ Điều khiển Thiết bị &nbsp;
          <small>
            <small>Quản lý và điều khiển các thiết bị IoT</small>
          </small>
        </h1>

        {/* Tổng quan */}
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Widget>
              <div className={s.statCard}>
                <div className={s.statIcon}>⚡</div>
                <div className={s.statInfo}>
                  <h4>{totalPowerConsumption}W</h4>
                  <small>Tổng công suất</small>
                </div>
              </div>
            </Widget>
          </Col>
          
          <Col lg={3} md={6} className="mb-3">
            <Widget>
              <div className={s.statCard}>
                <div className={s.statIcon}>🔌</div>
                <div className={s.statInfo}>
                  <h4>{activeDevices}/{devices.length}</h4>
                  <small>Thiết bị hoạt động</small>
                </div>
              </div>
            </Widget>
          </Col>
          
          <Col lg={3} md={6} className="mb-3">
            <Widget>
              <div className={s.statCard}>
                <div className={s.statIcon}>💰</div>
                <div className={s.statInfo}>
                  <h4>{(totalPowerConsumption * 24 * 0.002).toFixed(2)}k</h4>
                  <small>Chi phí/ngày (VNĐ)</small>
                </div>
              </div>
            </Widget>
          </Col>
          
          <Col lg={3} md={6} className="mb-3">
            <Widget>
              <div className={s.statCard}>
                <div className={s.statIcon}>📱</div>
                <div className={s.statInfo}>
                  <h4>Kết nối</h4>
                  <small className="text-success">Trực tuyến</small>
                </div>
              </div>
            </Widget>
          </Col>
        </Row>

        {/* Danh sách thiết bị */}
        <Row>
          {devices.map((device) => (
            <Col lg={6} md={12} key={device.id} className="mb-4">
              <Widget>
                <div className={s.deviceCard}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center">
                      <span className={s.deviceIcon}>{device.icon}</span>
                      <div>
                        <h6 className="mb-1">{device.name}</h6>
                        <small className="text-muted">{device.description}</small>
                      </div>
                    </div>
                    
                    <Badge color={this.getDeviceStatusColor(device.isOn)}>
                      {this.getDeviceStatusText(device.isOn)}
                    </Badge>
                  </div>

                  <div className={s.deviceInfo}>
                    <div className="row mb-3">
                      <div className="col-6">
                        <small className="text-muted">Công suất:</small>
                        <div>{device.powerConsumption}</div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Lịch hoạt động:</small>
                        <div style={{ fontSize: '0.85rem' }}>{device.schedule}</div>
                      </div>
                    </div>

                    {device.type === 'feeder' && device.lastFeed && (
                      <div className="mb-3">
                        <small className="text-muted">Lần cho ăn cuối:</small>
                        <div>{device.lastFeed}</div>
                      </div>
                    )}
                  </div>

                  <div className={s.deviceControls}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <span className="mr-2">Bật/Tắt:</span>
                        <Button
                          size="sm"
                          color={device.isOn ? 'danger' : 'success'}
                          onClick={() => this.handleToggleDevice(device.id)}
                        >
                          {device.isOn ? 'Tắt' : 'Bật'}
                        </Button>
                      </div>

                      {device.type === 'feeder' && (
                        <Button
                          size="sm"
                          color="primary"
                          outline
                          onClick={this.handleFeedNow}
                        >
                          Cho ăn ngay
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Widget>
            </Col>
          ))}
        </Row>

        {/* Điều khiển tổng thể */}
        <Row>
          <Col lg={12}>
            <Widget 
              title={
                <h5>
                  🎮 Điều khiển tổng thể
                </h5>
              }
            >
              <div className="row">
                <div className="col-md-4 mb-3">
                  <Button 
                    color="success" 
                    block
                    onClick={() => {
                      this.setState(prevState => ({
                        devices: prevState.devices.map(device => ({ ...device, isOn: true }))
                      }));
                    }}
                  >
                    🟢 Bật tất cả thiết bị
                  </Button>
                </div>
                <div className="col-md-4 mb-3">
                  <Button 
                    color="danger" 
                    block
                    onClick={() => {
                      this.setState(prevState => ({
                        devices: prevState.devices.map(device => ({ ...device, isOn: false }))
                      }));
                    }}
                  >
                    🔴 Tắt tất cả thiết bị
                  </Button>
                </div>
                <div className="col-md-4 mb-3">
                  <Button 
                    color="warning" 
                    block
                    onClick={() => {
                      // Reset về trạng thái mặc định
                      window.location.reload();
                    }}
                  >
                    🔄 Reset về mặc định
                  </Button>
                </div>
              </div>
            </Widget>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Controls;