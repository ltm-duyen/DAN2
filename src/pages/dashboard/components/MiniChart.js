import React from 'react';
import { Card, CardBody } from 'reactstrap';
import s from './MiniChart.module.scss';

const MiniChart = ({ title, data, color = '#007bff', unit = '' }) => {
    // Tạo dữ liệu mẫu cho 24h (mỗi giờ 1 điểm)
    const chartData = data || Array.from({ length: 24 }, () => Math.random() * 10 + 20);

    // Tính toán để vẽ đường line chart bằng SVG
    const maxValue = Math.max(...chartData);
    const minValue = Math.min(...chartData);
    const range = maxValue - minValue || 1; // Tránh chia cho 0

    const width = 300;
    const height = 80;
    const padding = 10;

    // Tạo các điểm cho đường line
    const points = chartData.map((value, index) => {
        const x = padding + (index / (chartData.length - 1)) * (width - 2 * padding);
        const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);
        return `${x},${y}`;
    }).join(' ');

    // Tạo path cho gradient fill
    const pathData = chartData.map((value, index) => {
        const x = padding + (index / (chartData.length - 1)) * (width - 2 * padding);
        const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);
        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ') + ` L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;

    return (
        <Card className={s.miniChart}>
            <CardBody className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className={`mb-0 ${s.chartTitle}`}>{title}</h6>
                    <small className="text-muted">24h</small>
                </div>

                <div className={s.chartContainer}>
                    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
                        <defs>
                            <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
                                <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.05 }} />
                            </linearGradient>
                        </defs>

                        {/* Gradient fill */}
                        <path
                            d={pathData}
                            fill={`url(#gradient-${title.replace(/\s+/g, '')})`}
                            stroke="none"
                        />

                        {/* Line */}
                        <polyline
                            points={points}
                            fill="none"
                            stroke={color}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Dots on hover */}
                        {chartData.map((value, index) => {
                            const x = padding + (index / (chartData.length - 1)) * (width - 2 * padding);
                            const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);
                            return (
                                <circle
                                    key={index}
                                    cx={x}
                                    cy={y}
                                    r="2"
                                    fill={color}
                                    className={s.chartDot}
                                />
                            );
                        })}
                    </svg>
                </div>

                <div className={`${s.chartStats} mt-2 d-flex justify-content-between`}>
                    <small className="text-muted">
                        Min: {minValue.toFixed(1)}{unit}
                    </small>
                    <small className="text-muted">
                        Max: {maxValue.toFixed(1)}{unit}
                    </small>
                </div>
            </CardBody>
        </Card>
    );
};

export default MiniChart;