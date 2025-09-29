import React from 'react';
import { Row, Col, Card, CardBody, Button, Form, FormGroup, Label, Input, Alert } from 'reactstrap';
import Widget from '../../components/Widget';
import s from './Settings.module.scss';

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      systemSettings: {
        autoFeedingEnabled: true,
        feedingTimes: ['08:00', '12:00', '18:00'],
        temperatureRange: { min: 25, max: 28 },
        pHRange: { min: 6.5, max: 7.5 },
        oxygenThreshold: 5.0,
        alertsEnabled: true,
        emailNotifications: true,
        smsNotifications: false,
        autoLightControl: true,
        lightOnTime: '06:00',
        lightOffTime: '22:00'
      },
      networkSettings: {
        wifiSSID: 'FishTank_IoT',
        wifiPassword: '********',
        mqttBroker: 'mqtt.fishtank.local',
        deviceID: 'FISHTANK_001',
        firmwareVersion: '1.2.3',
        lastUpdate: '2024-09-15'
      },
      maintenanceSchedule: {
        waterChange: { frequency: 'Hàng tuần', lastDone: '2024-09-10', nextDue: '2024-09-17' },
        filterCleaning: { frequency: '2 tuần/lần', lastDone: '2024-09-08', nextDue: '2024-09-22' },
        pHCheck: { frequency: 'Hàng ngày', lastDone: 'Hôm nay', nextDue: 'Ngày mai' },
        equipmentCheck: { frequency: 'Hàng tháng', lastDone: '2024-09-01', nextDue: '2024-10-01' }
      },
      showAlert: false,
      alertMessage: '',
      alertType: 'success'
    };
  }

  handleSystemSettingChange = (field, value) => {
    this.setState(prevState => ({
      systemSettings: {
        ...prevState.systemSettings,
        [field]: value
      }
    }));
  }

  handleRangeChange = (rangeField, minMax, value) => {
    this.setState(prevState => ({
      systemSettings: {
        ...prevState.systemSettings,
        [rangeField]: {
          ...prevState.systemSettings[rangeField],
          [minMax]: parseFloat(value)
        }
      }
    }));
  }

  handleFeedingTimeChange = (index, value) => {
    this.setState(prevState => ({
      systemSettings: {
        ...prevState.systemSettings,
        feedingTimes: prevState.systemSettings.feedingTimes.map((time, i) =>
          i === index ? value : time
        )
      }
    }));
  }

  addFeedingTime = () => {
    this.setState(prevState => ({
      systemSettings: {
        ...prevState.systemSettings,
        feedingTimes: [...prevState.systemSettings.feedingTimes, '12:00']
      }
    }));
  }

  removeFeedingTime = (index) => {
    this.setState(prevState => ({
      systemSettings: {
        ...prevState.systemSettings,
        feedingTimes: prevState.systemSettings.feedingTimes.filter((_, i) => i !== index)
      }
    }));
  }

  saveSettings = () => {
    // Mô phỏng lưu cài đặt
    this.showAlert('Cài đặt đã được lưu thành công!', 'success');
  }

  resetToDefault = () => {
    // Reset về cài đặt mặc định
    this.setState({
      systemSettings: {
        autoFeedingEnabled: true,
        feedingTimes: ['08:00', '12:00', '18:00'],
        temperatureRange: { min: 25, max: 28 },
        pHRange: { min: 6.5, max: 7.5 },
        oxygenThreshold: 5.0,
        alertsEnabled: true,
        emailNotifications: true,
        smsNotifications: false,
        autoLightControl: true,
        lightOnTime: '06:00',
        lightOffTime: '22:00'
      }
    });
    this.showAlert('Đã reset về cài đặt mặc định!', 'warning');
  }

  showAlert = (message, type) => {
    this.setState({
      showAlert: true,
      alertMessage: message,
      alertType: type
    });

    setTimeout(() => {
      this.setState({ showAlert: false });
    }, 3000);
  }

  exportSettings = () => {
    const dataStr = JSON.stringify(this.state.systemSettings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'fishtank_settings.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    this.showAlert('Cài đặt đã được xuất thành công!', 'success');
  }

  render() {
    const { systemSettings, networkSettings, maintenanceSchedule, showAlert, alertMessage, alertType } = this.state;

    return (
      <div>
        <h1 className="page-title">
          ⚙️ Cài đặt Hệ thống &nbsp;
          <small>
            <small>Cấu hình và quản lý hệ thống IoT</small>
          </small>
        </h1>

        {showAlert && (
          <Alert color={alertType} className="mb-4">
            {alertMessage}
          </Alert>
        )}

        <Row>
          {/* Cài đặt hệ thống */}
          <Col lg={6} className="mb-4">
            <Widget
              title={
                <h5>
                  🎛️ Cài đặt hệ thống
                </h5>
              }
            >
              <Form>
                {/* Cho ăn tự động */}
                <FormGroup className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <Label>Cho ăn tự động</Label>
                    <Input
                      type="checkbox"
                      checked={systemSettings.autoFeedingEnabled}
                      onChange={(e) => this.handleSystemSettingChange('autoFeedingEnabled', e.target.checked)}
                      style={{ width: 'auto' }}
                    />
                  </div>
                </FormGroup>

                {/* Thời gian cho ăn */}
                {systemSettings.autoFeedingEnabled && (
                  <FormGroup className="mb-3">
                    <Label>Thời gian cho ăn</Label>
                    {systemSettings.feedingTimes.map((time, index) => (
                      <div key={index} className="d-flex mb-2">
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => this.handleFeedingTimeChange(index, e.target.value)}
                          className="mr-2"
                        />
                        {systemSettings.feedingTimes.length > 1 && (
                          <Button
                            color="danger"
                            size="sm"
                            onClick={() => this.removeFeedingTime(index)}
                          >
                            Xóa
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button color="success" size="sm" onClick={this.addFeedingTime}>
                      + Thêm giờ cho ăn
                    </Button>
                  </FormGroup>
                )}

                {/* Khoảng nhiệt độ */}
                <FormGroup className="mb-3">
                  <Label>Khoảng nhiệt độ an toàn (°C)</Label>
                  <div className="row">
                    <div className="col-6">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={systemSettings.temperatureRange.min}
                        onChange={(e) => this.handleRangeChange('temperatureRange', 'min', e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <Input
                        type="number"
                        placeholder="Max"
                        value={systemSettings.temperatureRange.max}
                        onChange={(e) => this.handleRangeChange('temperatureRange', 'max', e.target.value)}
                      />
                    </div>
                  </div>
                </FormGroup>

                {/* Khoảng pH */}
                <FormGroup className="mb-3">
                  <Label>Khoảng pH an toàn</Label>
                  <div className="row">
                    <div className="col-6">
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Min"
                        value={systemSettings.pHRange.min}
                        onChange={(e) => this.handleRangeChange('pHRange', 'min', e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Max"
                        value={systemSettings.pHRange.max}
                        onChange={(e) => this.handleRangeChange('pHRange', 'max', e.target.value)}
                      />
                    </div>
                  </div>
                </FormGroup>

                {/* Ngưỡng oxy */}
                <FormGroup className="mb-3">
                  <Label>Ngưỡng oxy tối thiểu (mg/L)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={systemSettings.oxygenThreshold}
                    onChange={(e) => this.handleSystemSettingChange('oxygenThreshold', parseFloat(e.target.value))}
                  />
                </FormGroup>

                {/* Điều khiển đèn tự động */}
                <FormGroup className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <Label>Điều khiển đèn tự động</Label>
                    <Input
                      type="checkbox"
                      checked={systemSettings.autoLightControl}
                      onChange={(e) => this.handleSystemSettingChange('autoLightControl', e.target.checked)}
                      style={{ width: 'auto' }}
                    />
                  </div>
                </FormGroup>

                {/* Thời gian bật/tắt đèn */}
                {systemSettings.autoLightControl && (
                  <div className="row mb-3">
                    <div className="col-6">
                      <Label>Bật đèn lúc</Label>
                      <Input
                        type="time"
                        value={systemSettings.lightOnTime}
                        onChange={(e) => this.handleSystemSettingChange('lightOnTime', e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <Label>Tắt đèn lúc</Label>
                      <Input
                        type="time"
                        value={systemSettings.lightOffTime}
                        onChange={(e) => this.handleSystemSettingChange('lightOffTime', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </Form>
            </Widget>
          </Col>

          {/* Cài đặt thông báo */}
          <Col lg={6} className="mb-4">
            <Widget
              title={
                <h5>
                  🔔 Cài đặt thông báo
                </h5>
              }
            >
              <Form>
                <FormGroup className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <Label>Bật cảnh báo hệ thống</Label>
                    <Input
                      type="checkbox"
                      checked={systemSettings.alertsEnabled}
                      onChange={(e) => this.handleSystemSettingChange('alertsEnabled', e.target.checked)}
                      style={{ width: 'auto' }}
                    />
                  </div>
                </FormGroup>

                <FormGroup className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <Label>Thông báo qua Email</Label>
                    <Input
                      type="checkbox"
                      checked={systemSettings.emailNotifications}
                      onChange={(e) => this.handleSystemSettingChange('emailNotifications', e.target.checked)}
                      style={{ width: 'auto' }}
                    />
                  </div>
                </FormGroup>

                <FormGroup className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <Label>Thông báo qua SMS</Label>
                    <Input
                      type="checkbox"
                      checked={systemSettings.smsNotifications}
                      onChange={(e) => this.handleSystemSettingChange('smsNotifications', e.target.checked)}
                      style={{ width: 'auto' }}
                    />
                  </div>
                </FormGroup>
              </Form>

              <hr />

              <h6>📡 Thông tin mạng</h6>
              <div className={s.networkInfo}>
                <div className="mb-2">
                  <strong>WiFi SSID:</strong> {networkSettings.wifiSSID}
                </div>
                <div className="mb-2">
                  <strong>MQTT Broker:</strong> {networkSettings.mqttBroker}
                </div>
                <div className="mb-2">
                  <strong>Device ID:</strong> {networkSettings.deviceID}
                </div>
                <div className="mb-2">
                  <strong>Firmware:</strong> v{networkSettings.firmwareVersion}
                </div>
                <div className="mb-2">
                  <strong>Cập nhật lần cuối:</strong> {networkSettings.lastUpdate}
                </div>
              </div>
            </Widget>
          </Col>
        </Row>

        {/* Lịch bảo trì */}
        <Row>
          <Col lg={12} className="mb-4">
            <Widget
              title={
                <h5>
                  🔧 Lịch bảo trì hệ thống
                </h5>
              }
            >
              <div className="row">
                {Object.entries(maintenanceSchedule).map(([key, schedule]) => (
                  <div key={key} className="col-md-3 col-6 mb-3">
                    <div className={s.maintenanceCard}>
                      <h6>{key === 'waterChange' ? 'Thay nước' :
                        key === 'filterCleaning' ? 'Vệ sinh lọc' :
                          key === 'pHCheck' ? 'Kiểm tra pH' : 'Kiểm tra thiết bị'}</h6>
                      <div className="mb-2">
                        <small className="text-muted">Tần suất:</small>
                        <div>{schedule.frequency}</div>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted">Lần cuối:</small>
                        <div>{schedule.lastDone}</div>
                      </div>
                      <div>
                        <small className="text-muted">Tiếp theo:</small>
                        <div className="text-primary">{schedule.nextDue}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Widget>
          </Col>
        </Row>

        {/* Nút điều khiển */}
        <Row>
          <Col lg={12}>
            <Widget>
              <div className="d-flex flex-wrap gap-2">
                <Button color="primary" onClick={this.saveSettings}>
                  💾 Lưu cài đặt
                </Button>
                <Button color="secondary" onClick={this.exportSettings}>
                  📤 Xuất cài đặt
                </Button>
                <Button color="warning" onClick={this.resetToDefault}>
                  🔄 Reset về mặc định
                </Button>
                <Button color="info" onClick={() => window.location.reload()}>
                  🔄 Tải lại trang
                </Button>
              </div>
            </Widget>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Settings;