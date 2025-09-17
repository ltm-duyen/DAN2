import React from 'react';
import { Card, CardBody, Badge, Button } from 'reactstrap';
import s from './AlertsPanel.module.scss';

const AlertsPanel = ({ alerts, onDismissAlert, onResetAlerts }) => {
    const getAlertIcon = (type) => {
        switch (type) {
            case 'danger': return '🔴';
            case 'warning': return '🟡';
            case 'info': return '🔵';
            default: return '⚠️';
        }
    };

    const getAlertBadge = (type) => {
        switch (type) {
            case 'danger': return 'danger';
            case 'warning': return 'warning';
            case 'info': return 'info';
            default: return 'secondary';
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card className={s.alertsPanel}>
            <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">
                        <i className="fa fa-exclamation-triangle mr-2"></i>
                        Cảnh báo & Thông báo
                    </h6>
                    {alerts.length > 0 && (
                        <Button
                            size="sm"
                            color="secondary"
                            outline
                            onClick={onResetAlerts}
                        >
                            Reset tất cả
                        </Button>
                    )}
                </div>

                {alerts.length === 0 ? (
                    <div className={`${s.noAlerts} text-center py-4`}>
                        <i className="fa fa-check-circle text-success" style={{ fontSize: '2rem' }}></i>
                        <p className="text-muted mt-2 mb-0">Không có cảnh báo nào</p>
                        <small className="text-muted">Hệ thống hoạt động bình thường</small>
                    </div>
                ) : (
                    <div className={s.alertsList}>
                        {alerts.map((alert, index) => (
                            <div key={index} className={`${s.alertItem} ${s[alert.type]} mb-3`}>
                                <div className="d-flex align-items-start">
                                    <span className={`${s.alertIcon} mr-3`}>
                                        {getAlertIcon(alert.type)}
                                    </span>

                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <div className={`${s.alertTitle} mb-1`}>
                                                    {alert.title}
                                                    <Badge
                                                        color={getAlertBadge(alert.type)}
                                                        className="ml-2"
                                                        style={{ fontSize: '0.7rem' }}
                                                    >
                                                        {alert.type === 'danger' ? 'Nghiêm trọng' :
                                                            alert.type === 'warning' ? 'Cảnh báo' : 'Thông tin'}
                                                    </Badge>
                                                </div>
                                                <p className={`${s.alertMessage} mb-1`}>
                                                    {alert.message}
                                                </p>
                                                <small className="text-muted">
                                                    {formatTime(alert.timestamp)}
                                                </small>
                                            </div>

                                            <Button
                                                size="sm"
                                                color="link"
                                                className={`${s.dismissBtn} p-1`}
                                                onClick={() => onDismissAlert(index)}
                                            >
                                                <i className="fa fa-times"></i>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default AlertsPanel;