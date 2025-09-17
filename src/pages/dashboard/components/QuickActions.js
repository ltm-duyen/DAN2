import React from 'react';
import { Card, CardBody, Button, Row, Col } from 'reactstrap';
import s from './QuickActions.module.scss';

const QuickActions = ({
    onToggleLight,
    onFeedFish,
    onResetAlerts,
    lightStatus,
    isFeeding
}) => {
    const actions = [
        {
            id: 'light',
            icon: '💡',
            title: lightStatus ? 'Tắt đèn' : 'Bật đèn',
            description: lightStatus ? 'Đèn đang bật' : 'Đèn đang tắt',
            color: lightStatus ? 'warning' : 'success',
            onClick: onToggleLight,
            status: lightStatus
        },
        {
            id: 'feed',
            icon: '🍽️',
            title: 'Cho cá ăn',
            description: isFeeding ? 'Đang cho ăn...' : 'Cho ăn ngay lập tức',
            color: 'primary',
            onClick: onFeedFish,
            disabled: isFeeding
        },
        {
            id: 'reset',
            icon: '🔄',
            title: 'Reset cảnh báo',
            description: 'Xóa tất cả cảnh báo',
            color: 'secondary',
            onClick: onResetAlerts
        }
    ];

    return (
        <Card className={s.quickActions}>
            <CardBody>
                <h6 className="mb-3">
                    <i className="fa fa-bolt mr-2"></i>
                    Điều khiển nhanh
                </h6>

                <Row>
                    {actions.map((action, index) => (
                        <Col key={action.id} xs={12} className="mb-3">
                            <div className={`${s.actionItem} ${action.status ? s.actionActive : ''}`}>
                                <Button
                                    color={action.color}
                                    size="lg"
                                    block
                                    onClick={action.onClick}
                                    disabled={action.disabled}
                                    className={`${s.actionButton} d-flex align-items-center justify-content-start`}
                                >
                                    <span className={`${s.actionIcon} mr-3`}>
                                        {action.icon}
                                    </span>
                                    <div className="text-left">
                                        <div className={s.actionTitle}>
                                            {action.title}
                                        </div>
                                        <small className={s.actionDescription}>
                                            {action.description}
                                        </small>
                                    </div>

                                    {action.status && (
                                        <span className={`${s.statusIndicator} ml-auto`}>
                                            <i className="fa fa-circle"></i>
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </Col>
                    ))}
                </Row>

                <div className={`${s.emergencySection} mt-3 pt-3`} style={{ borderTop: '1px solid #eee' }}>
                    <Button
                        color="danger"
                        size="sm"
                        block
                        outline
                        className={s.emergencyButton}
                    >
                        <i className="fa fa-exclamation-triangle mr-2"></i>
                        Tắt khẩn cấp tất cả thiết bị
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
};

export default QuickActions;