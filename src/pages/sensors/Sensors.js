import React from 'react';
import { Row, Col, Card, CardBody, Progress, Badge } from 'reactstrap';
import Widget from '../../components/Widget';
import s from './Sensors.module.scss';

class Sensors extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sensors: {
                pumpCurrent: {
                    name: 'Dòng điện máy bơm oxy',
                    value: 2.4,
                    unit: 'A',
                    status: 'normal',
                    range: { min: 2.0, max: 3.5 },
                    location: 'Máy bơm oxy',
                    lastUpdate: new Date().toLocaleTimeString(),
                    description: 'Giám sát dòng điện tiêu thụ của máy bơm oxy'
                },
                turbidity: {
                    name: 'Cảm biến độ đục nước',
                    value: 12.3,
                    unit: 'NTU',
                    status: 'warning',
                    range: { min: 0, max: 15 },
                    location: 'Hồ cá chính',
                    lastUpdate: new Date().toLocaleTimeString(),
                    description: 'Đo độ trong suốt của nước hồ'
                },
                temperature: {
                    name: 'Cảm biến nhiệt độ nước',
                    value: 26.5,
                    unit: '°C',
                    status: 'normal',
                    range: { min: 24, max: 28 },
                    location: 'Hồ cá chính',
                    lastUpdate: new Date().toLocaleTimeString(),
                    description: 'Theo dõi nhiệt độ nước trong hồ cá'
                }
            }
        };
    }

    componentDidMount() {
        // Mô phỏng cập nhật dữ liệu thời gian thực
        this.interval = setInterval(() => {
            this.updateSensorData();
        }, 3000);
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    updateSensorData = () => {
        this.setState(prevState => ({
            sensors: {
                ...prevState.sensors,
                pumpCurrent: {
                    ...prevState.sensors.pumpCurrent,
                    value: +(2.0 + Math.random() * 1.5).toFixed(1),
                    lastUpdate: new Date().toLocaleTimeString()
                },
                turbidity: {
                    ...prevState.sensors.turbidity,
                    value: +(5 + Math.random() * 15).toFixed(1),
                    lastUpdate: new Date().toLocaleTimeString()
                },
                temperature: {
                    ...prevState.sensors.temperature,
                    value: +(24 + Math.random() * 6).toFixed(1),
                    lastUpdate: new Date().toLocaleTimeString()
                }
            }
        }));
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

    render() {
        const { sensors } = this.state;

        return (
            <div>
                <h1 className="page-title">
                    🌡️ Quản lý Cảm biến &nbsp;
                    <small>
                        <small>Theo dõi các thông số môi trường</small>
                    </small>
                </h1>

                <Row>
                    {Object.keys(sensors).map((key) => {
                        const sensor = sensors[key];
                        const percentage = this.calculatePercentage(sensor.value, sensor.range);

                        return (
                            <Col lg={4} md={6} key={key} className="mb-4">
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
                                                {sensor.value}
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
                                        <h4 className="text-success">3</h4>
                                        <small className="text-muted">Tổng số cảm biến</small>
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