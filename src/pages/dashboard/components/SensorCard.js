import React from 'react';
import { Card, CardBody } from 'reactstrap';
import s from './SensorCard.module.scss';

const SensorCard = ({
    icon,
    title,
    value,
    unit,
    status = 'normal',
    color = 'primary',
    description
}) => {
    const getStatusColor = () => {
        switch (status) {
            case 'danger': return 'text-danger';
            case 'warning': return 'text-warning';
            case 'success': return 'text-success';
            default: return 'text-primary';
        }
    };

    const getCardClass = () => {
        switch (status) {
            case 'danger': return s.cardDanger;
            case 'warning': return s.cardWarning;
            case 'success': return s.cardSuccess;
            default: return s.cardNormal;
        }
    };

    return (
        <Card className={`${s.sensorCard} ${getCardClass()}`}>
            <CardBody className="d-flex flex-column align-items-center text-center">
                <div className={`${s.iconContainer} mb-3`}>
                    <span className={`${s.icon} ${getStatusColor()}`}>
                        {icon}
                    </span>
                </div>

                <h6 className="mb-2 text-muted">{title}</h6>

                <div className={`${s.valueContainer} mb-2`}>
                    <span className={`${s.value} ${getStatusColor()}`}>
                        {value}
                    </span>
                    {unit && (
                        <span className={`${s.unit} text-muted ml-1`}>
                            {unit}
                        </span>
                    )}
                </div>

                {description && (
                    <small className="text-muted">{description}</small>
                )}
            </CardBody>
        </Card>
    );
};

export default SensorCard;