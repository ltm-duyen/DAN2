import React from 'react';
import { Row, Col, Card, CardBody, Progress, Badge } from 'reactstrap';
import Widget from '../../components/Widget';
import s from './Sensors.module.scss';

class Sensors extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // API Configuration
            apiBaseUrl: "http://localhost/aquabox/test_data.php?action=latest",

            // Dữ liệu cảm biến từ API
            sensors: {
                temperature: {
                    name: 'Cảm biến nhiệt độ nước',
                    value: 0,
                    unit: '°C',
                    status: 'normal',
                    range: { min: 24, max: 30 },
                    location: 'Hồ cá chính',
                    lastUpdate: new Date().toLocaleTimeString(),
                    description: 'Theo dõi nhiệt độ nước trong hồ cá'
                },
                turbidity: {
                    name: 'Cảm biến độ đục nước',
                    value: 0,
                    unit: 'NTU',
                    status: 'normal',
                    range: { min: 0, max: 100 },
                    location: 'Hồ cá chính',
                    lastUpdate: new Date().toLocaleTimeString(),
                    description: 'Đo độ trong suốt của nước hồ'
                },
                current: {
                    name: 'Dòng điện máy bơm',
                    value: 0,
                    unit: 'A',
                    status: 'normal',
                    range: { min: 0.3, max: 1.0 },
                    location: 'Máy bơm nước',
                    lastUpdate: new Date().toLocaleTimeString(),
                    description: 'Giám sát dòng điện tiêu thụ của máy bơm'
                },
                dissolvedOxygen: {
                    name: 'Cảm biến oxy hòa tan',
                    value: 0,
                    unit: 'mg/L',
                    status: 'normal',
                    range: { min: 6, max: 12 },
                    location: 'Hồ cá chính',
                    lastUpdate: new Date().toLocaleTimeString(),
                    description: 'Đo lượng oxy hòa tan trong nước'
                }
                ,
                waterLevel: {
                    name: 'Mực nước',
                    value: 0,
                    unit: 'cm',
                    status: 'normal',
                    range: { min: 10, max: 40 },
                    location: 'Hồ cá chính',
                    lastUpdate: new Date().toLocaleTimeString(),
                    description: 'Mức nước đo bằng cm'
                }
            },

            // Thông tin từ API
            waterQuality: 'UNKNOWN',
            rawData: null,
            isLoading: true,
            connectionStatus: 'connecting',
            lastApiUpdate: null
        };
    }

    componentDidMount() {
        // Fetch dữ liệu lần đầu
        this.fetchSensorData();

        // Cập nhật dữ liệu mỗi 5 giây
        this.interval = setInterval(() => {
            this.fetchSensorData();
        }, 5000);
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    // Fetch dữ liệu từ API
    // Fetch dữ liệu từ API
    fetchSensorData = async () => {
        try {
            console.log('Fetching sensor data from:', this.state.apiBaseUrl);
            const response = await fetch(this.state.apiBaseUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Sensor API Response:', result);

            // Sửa logic xử lý - data bây giờ là object, không phải array
            if (result.success && result.data) {
                const latestData = result.data; // Không cần [0] vì data là object
                console.log('Latest sensor data:', latestData);
                this.updateSensorData(latestData);
                this.setState({
                    isLoading: false,
                    connectionStatus: 'connected',
                    lastApiUpdate: new Date(),
                    waterQuality: latestData.water_quality || 'UNKNOWN',
                    rawData: latestData
                });
            } else {
                console.warn('No sensor data received from API:', result);
                this.setState({
                    isLoading: false,
                    connectionStatus: 'error'
                });
            }
        } catch (error) {
            console.error('Error fetching sensor data:', error);
            this.setState({
                connectionStatus: 'error',
                isLoading: false
            });
        }
    }

    // Cập nhật dữ liệu cảm biến từ API
    updateSensorData = (data) => {
        const now = new Date().toLocaleTimeString();

        // Đảm bảo có giá trị mặc định
        const temperatureValue = data.temperature_c !== undefined ? parseFloat(data.temperature_c) : 0;
        const turbidityValue = data.turbidity_ntu !== undefined ? parseFloat(data.turbidity_ntu) : 0;
        const currentValue = data.current_a !== undefined ? parseFloat(data.current_a) : 0;
        const dissolvedOxygenValue = data.dissolved_oxygen !== undefined ? parseFloat(data.dissolved_oxygen) : 0;
    const waterLevelValue = data.water_level_cm !== undefined ? parseFloat(data.water_level_cm) : 0;

        this.setState(prevState => ({
            sensors: {
                temperature: {
                    ...prevState.sensors.temperature,
                    value: temperatureValue.toFixed(1),
                    status: this.getTemperatureStatus(temperatureValue),
                    lastUpdate: now
                },
                turbidity: {
                    ...prevState.sensors.turbidity,
                    value: turbidityValue.toFixed(1),
                    status: this.getTurbidityStatus(turbidityValue),
                    lastUpdate: now
                },
                current: {
                    ...prevState.sensors.current,
                    value: currentValue.toFixed(3),
                    status: this.getCurrentStatus(currentValue),
                    lastUpdate: now
                },
                dissolvedOxygen: {
                    ...prevState.sensors.dissolvedOxygen,
                    value: dissolvedOxygenValue.toFixed(2),
                    status: this.getDissolvedOxygenStatus(dissolvedOxygenValue),
                    lastUpdate: now
                },
                waterLevel: {
                    ...prevState.sensors.waterLevel,
                    value: waterLevelValue.toFixed(2),
                    status: (waterLevelValue < 5 ? 'danger' : (waterLevelValue < 10 ? 'warning' : 'normal')),
                    lastUpdate: now
                }
            }
        }));
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
        if (current > 1.0 || current < 0.2) return 'danger';
        if (current > 0.8 || current < 0.3) return 'warning';
        return 'normal';
    }

    // Xác định trạng thái oxy hòa tan
    getDissolvedOxygenStatus = (do_value) => {
        if (do_value < 5.0) return 'danger';     // Dưới 5mg/L nguy hiểm
        if (do_value < 6.0) return 'warning';    // 5-6mg/L cảnh báo
        if (do_value > 12.0) return 'warning';   // Trên 12mg/L cũng không tốt
        return 'normal';                         // 6-12mg/L bình thường
    }

    getStatusColor = (status) => {
        switch (status) {
            case 'danger': return 'danger';
            case 'warning': return 'warning';
            case 'normal': return 'success';
            default: return 'secondary';
        }
    }

    getStatusText = (status) => {
        switch (status) {
            case 'danger': return 'Nguy hiểm';
            case 'warning': return 'Cảnh báo';
            case 'normal': return 'Bình thường';
            default: return 'Không xác định';
        }
    }

    calculatePercentage = (value, range) => {
        // Kiểm tra nếu range undefined hoặc không có min/max
        if (!range || typeof range.min === 'undefined' || typeof range.max === 'undefined') {
            return 0;
        }

        const percentage = ((value - range.min) / (range.max - range.min)) * 100;
        return Math.max(0, Math.min(100, percentage));
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
            waterQuality,
            rawData,
            isLoading,
            connectionStatus,
            lastApiUpdate
        } = this.state;

        return (
            <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="page-title mb-0">
                        🌡️ Quản lý Cảm biến &nbsp;
                        <small>
                            <small>Theo dõi các thông số môi trường</small>
                        </small>
                    </h1>

                    <div className="d-flex align-items-center">
                        {this.getConnectionBadge()}
                        {lastApiUpdate && (
                            <small className="text-muted ml-3">
                                Cập nhật: {lastApiUpdate.toLocaleTimeString()}
                            </small>
                        )}
                    </div>
                </div>

                {/* Debug Panel - Hiển thị dữ liệu API thô */}


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

                <Row>
                    {Object.keys(sensors).map((key) => {
                        const sensor = sensors[key];
                        const percentage = this.calculatePercentage(parseFloat(sensor.value), sensor.range);

                        return (
                            <Col lg={3} md={6} key={key} className="mb-4">
                                <Widget>
                                    <div className={s.sensorWidget}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="mb-0">{sensor.name}</h5>
                                            <Badge color={this.getStatusColor(sensor.status)}>
                                                {this.getStatusText(sensor.status)}
                                            </Badge>
                                        </div>

                                        <div className={s.sensorValue}>
                                            <span className={`${s.value} text-${this.getStatusColor(sensor.status)}`}>
                                                {isLoading ? '...' : sensor.value}
                                            </span>
                                            <span className={`${s.unit} text-muted`}>
                                                {sensor.unit}
                                            </span>
                                        </div>

                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between mb-1">
                                                <small className="text-muted">
                                                    Khoảng an toàn: {sensor.range ? `${sensor.range.min} - ${sensor.range.max}` : 'N/A'} {sensor.unit}
                                                </small>
                                                <small className="text-muted">
                                                    {percentage.toFixed(0)}%
                                                </small>
                                            </div>
                                            <Progress
                                                value={percentage}
                                                color={this.getStatusColor(sensor.status)}
                                                className="progress-sm"
                                            />
                                        </div>

                                        <div className={s.sensorInfo}>
                                            <div className="mb-2">
                                                <small className="text-muted">📍 Vị trí:</small>
                                                <div>{sensor.location}</div>
                                            </div>
                                            <div className="mb-2">
                                                <small className="text-muted">🕒 Cập nhật lần cuối:</small>
                                                <div>{sensor.lastUpdate}</div>
                                            </div>
                                            <div>
                                                <small className="text-muted">📝 Mô tả:</small>
                                                <div style={{ fontSize: '0.85rem' }}>{sensor.description}</div>
                                            </div>
                                        </div>
                                    </div>
                                </Widget>
                            </Col>
                        );
                    })}
                </Row>

                {/* Thông tin tổng quan */}
                <Row>
                    <Col lg={12}>
                        <Widget
                            title={
                                <h5>
                                    📊 Tổng quan hệ thống cảm biến
                                </h5>
                            }
                        >
                            <div className="row">
                                <div className="col-md-3 col-6 text-center mb-3">
                                    <div className={s.statCard}>
                                        <h4 className="text-success">5</h4>
                                        <small className="text-muted">Tổng số giá trị</small>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6 text-center mb-3">
                                    <div className={s.statCard}>
                                        <h4 className="text-success">
                                            {Object.values(sensors).filter(s => s.status === 'normal').length}
                                        </h4>
                                        <small className="text-muted">Hoạt động bình thường</small>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6 text-center mb-3">
                                    <div className={s.statCard}>
                                        <h4 className="text-warning">
                                            {Object.values(sensors).filter(s => s.status === 'warning').length}
                                        </h4>
                                        <small className="text-muted">Cảnh báo</small>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6 text-center mb-3">
                                    <div className={s.statCard}>
                                        <h4 className="text-danger">
                                            {Object.values(sensors).filter(s => s.status === 'danger').length}
                                        </h4>
                                        <small className="text-muted">Nguy hiểm</small>
                                    </div>
                                </div>
                            </div>
                        </Widget>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default Sensors;