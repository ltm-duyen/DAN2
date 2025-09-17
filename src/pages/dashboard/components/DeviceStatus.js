import React from 'react';
import { Card, CardBody, Badge, Button } from 'reactstrap';
import s from './DeviceStatus.module.scss';

const DeviceStatus = ({ devices, onToggleDevice, onFeedFish }) => {
    const getStatusBadge = (isOn) => {
        return (
            <Badge
                color={isOn ? 'success' : 'secondary'}
                className={`${s.statusBadge} ${isOn ? s.statusOn : s.statusOff}`}
            >
                {isOn ? 'ON' : 'OFF'}
            </Badge>
        );
    };

    const getDeviceIcon = (type) => {
        switch (type) {
            case 'pump': return '🟢';
            case 'aerator': return '🟢';
            case 'light': return '💡';
            case 'feeder': return '🍽️';
            default: return '⚙️';
        }
    };

    return (
        <Card className={s.deviceCard}>
            <CardBody>
                <h6 className="mb-3">
                    <i className="fa fa-cogs mr-2"></i>
                    Trạng thái thiết bị
                </h6>

                <div className={s.deviceList}>
                    {devices.map((device, index) => (
                        <div key={index} className={`${s.deviceItem} d-flex justify-content-between align-items-center mb-3`}>
                            <div className="d-flex align-items-center">
                                <span className={`${s.deviceIcon} mr-3`}>
                                    {getDeviceIcon(device.type)}
                                </span>
                                <div>
                                    <div className={s.deviceName}>{device.name}</div>
                                    {device.type === 'feeder' && device.lastFeed && (
                                        <small className="text-muted">
                                            Lần cuối: {device.lastFeed}
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div className="d-flex align-items-center">
                                {getStatusBadge(device.isOn)}

                                {device.type === 'feeder' ? (
                                    <Button
                                        size="sm"
                                        color="primary"
                                        className="ml-2"
                                        onClick={() => onFeedFish()}
                                    >
                                        Cho ăn ngay
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        color={device.isOn ? 'danger' : 'success'}
                                        className="ml-2"
                                        onClick={() => onToggleDevice(device.id)}
                                    >
                                        {device.isOn ? 'Tắt' : 'Bật'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
};

export default DeviceStatus;