import React from "react";
import { Row, Col, Badge } from "reactstrap";
import Widget from "../../../components/Widget";
import ApexChart from "react-apexcharts";
import s from "./Charts.module.scss";

class Charts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // API Configuration
      apiBaseUrl: "http://localhost/aquabox/test_data.php",

      // Dữ liệu biểu đồ từ API
      chartData: {
        temperature: [],
        turbidity: [],
        current: [],
        dissolvedOxygen: [],
        waterLevel: [],
        timestamps: []
      },

      // Cấu hình biểu đồ
      temperatureChart: {
        series: [{
          name: 'Nhiệt độ nước',
          data: []
        }],
        options: {
          chart: {
            type: 'line',
            height: 350,
            zoom: {
              enabled: true
            },
            animations: {
              enabled: true,
              easing: 'easeinout',
              speed: 800,
            }
          },
          stroke: {
            curve: 'smooth',
            width: 3
          },
          colors: ['#dc3545'],
          title: {
            text: 'Biểu đồ nhiệt độ nước 24h',
            align: 'left'
          },
          xaxis: {
            type: 'datetime',
            title: {
              text: 'Thời gian'
            }
          },
          yaxis: {
            title: {
              text: 'Nhiệt độ (°C)'
            },
            min: 20,
            max: 35
          },
          tooltip: {
            x: {
              format: 'dd/MM/yy HH:mm'
            }
          },
          grid: {
            borderColor: '#e7e7e7',
            row: {
              colors: ['#f3f3f3', 'transparent'],
              opacity: 0.5
            },
          }
        }
      },

      turbidityChart: {
        series: [{
          name: 'Độ đục nước',
          data: []
        }],
        options: {
          chart: {
            type: 'area',
            height: 350,
            zoom: {
              enabled: true
            }
          },
          stroke: {
            curve: 'smooth'
          },
          fill: {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.7,
              opacityTo: 0.3,
            }
          },
          colors: ['#ffc107'],
          title: {
            text: 'Biểu đồ độ đục nước 24h',
            align: 'left'
          },
          xaxis: {
            type: 'datetime',
            title: {
              text: 'Thời gian'
            }
          },
          yaxis: {
            title: {
              text: 'Độ đục (NTU)'
            }
          },
          tooltip: {
            x: {
              format: 'dd/MM/yy HH:mm'
            }
          }
        }
      },

      currentChart: {
        series: [{
          name: 'Dòng điện máy bơm',
          data: []
        }],
        options: {
          chart: {
            type: 'line',
            height: 350,
            zoom: {
              enabled: true
            }
          },
          stroke: {
            curve: 'stepline',
            width: 2
          },
          colors: ['#28a745'],
          title: {
            text: 'Biểu đồ dòng điện máy bơm 24h',
            align: 'left'
          },
          xaxis: {
            type: 'datetime',
            title: {
              text: 'Thời gian'
            }
          },
          yaxis: {
            title: {
              text: 'Dòng điện (A)'
            },
            min: 0,
            max: 2
          },
          tooltip: {
            x: {
              format: 'dd/MM/yy HH:mm'
            }
          }
        }
      },

      dissolvedOxygenChart: {
        series: [{
          name: 'Oxy hòa tan',
          data: []
        }],
        options: {
          chart: {
            type: 'area',
            height: 350,
            zoom: {
              enabled: true
            }
          },
          stroke: {
            curve: 'smooth'
          },
          fill: {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.7,
              opacityTo: 0.3,
            }
          },
          colors: ['#17a2b8'],
          title: {
            text: 'Biểu đồ oxy hòa tan 24h',
            align: 'left'
          },
          xaxis: {
            type: 'datetime',
            title: {
              text: 'Thời gian'
            }
          },
          yaxis: {
            title: {
              text: 'Oxy hòa tan (mg/L)'
            },
            min: 0,
            max: 15
          },
          tooltip: {
            x: {
              format: 'dd/MM/yy HH:mm'
            }
          }
        }
      },

      // Trạng thái
      isLoading: true,
      connectionStatus: 'connecting',
      lastUpdate: null,
      totalDataPoints: 0
    };
  }

  componentDidMount() {
    // Fetch dữ liệu lần đầu
    this.fetchAllData();

    // Cập nhật dữ liệu mỗi 30 giây
    this.interval = setInterval(() => {
      this.fetchAllData();
    }, 30000);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  // Fetch tất cả dữ liệu từ API
  fetchAllData = async () => {
    try {
      console.log('Fetching all chart data from:', this.state.apiBaseUrl);
      const response = await fetch(this.state.apiBaseUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Chart API Response:', result);

      if (result.success && result.data && result.data.length > 0) {
        console.log('Processing chart data, total records:', result.data.length);
        this.processChartData(result.data);
        this.setState({
          isLoading: false,
          connectionStatus: 'connected',
          lastUpdate: new Date(),
          totalDataPoints: result.data.length
        });
      } else {
        console.warn('No chart data received from API:', result);
        this.setState({
          isLoading: false,
          connectionStatus: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      this.setState({
        connectionStatus: 'error',
        isLoading: false
      });
    }
  }

  // Xử lý dữ liệu cho biểu đồ
  processChartData = (dataArray) => {
    // Sắp xếp dữ liệu theo thời gian
    const sortedData = dataArray.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Chỉ lấy 100 điểm dữ liệu gần nhất để tránh lag
    const recentData = sortedData.slice(-100);

    const temperatureData = [];
    const turbidityData = [];
    const currentData = [];
    const dissolvedOxygenData = [];
  const waterLevelData = [];

    recentData.forEach(item => {
      const timestamp = new Date(item.created_at).getTime();

      temperatureData.push([timestamp, parseFloat(item.temperature_c)]);
      turbidityData.push([timestamp, parseFloat(item.turbidity_ntu)]);
      currentData.push([timestamp, parseFloat(item.current_a)]);
      dissolvedOxygenData.push([timestamp, parseFloat(item.dissolved_oxygen)]);
      waterLevelData.push([timestamp, parseFloat(item.water_level_cm || 0)]);
    });

    console.log('Processed chart data:', {
      temperature: temperatureData.length,
      turbidity: turbidityData.length,
      current: currentData.length,
      dissolvedOxygen: dissolvedOxygenData.length
    });

    this.setState(prevState => ({
      temperatureChart: {
        ...prevState.temperatureChart,
        series: [{
          name: 'Nhiệt độ nước',
          data: temperatureData
        }]
      },
      turbidityChart: {
        ...prevState.turbidityChart,
        series: [{
          name: 'Độ đục nước',
          data: turbidityData
        }]
      },
      currentChart: {
        ...prevState.currentChart,
        series: [{
          name: 'Dòng điện máy bơm',
          data: currentData
        }]
      },
      dissolvedOxygenChart: {
        ...prevState.dissolvedOxygenChart,
        series: [{
          name: 'Oxy hòa tan',
          data: dissolvedOxygenData
        }]
      }
      ,
      waterLevelChart: {
        series: [{
          name: 'Mực nước (cm)',
          data: waterLevelData
        }]
      }
    }));
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
      temperatureChart,
      turbidityChart,
      currentChart,
      dissolvedOxygenChart,
      isLoading,
      connectionStatus,
      lastUpdate,
      totalDataPoints
    } = this.state;

    return (
      <div className={s.root}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="page-title mb-0">
            📊 Biểu đồ IoT &nbsp;
            <small>
              <small>Lịch sử dữ liệu cảm biến</small>
            </small>
          </h1>

          <div className="d-flex align-items-center">
            {this.getConnectionBadge()}
            {lastUpdate && (
              <small className="text-muted ml-3">
                Cập nhật: {lastUpdate.toLocaleTimeString()}
              </small>
            )}
          </div>
        </div>

        {/* Thống kê tổng quan */}
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Widget>
              <div className="text-center">
                <h4 className="text-primary">{totalDataPoints}</h4>
                <small className="text-muted">Tổng điểm dữ liệu</small>
              </div>
            </Widget>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Widget>
              <div className="text-center">
                <h4 className="text-success">3</h4>
                <small className="text-muted">Cảm biến hoạt động</small>
              </div>
            </Widget>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Widget>
              <div className="text-center">
                <h4 className="text-info">5s</h4>
                <small className="text-muted">Chu kỳ đo</small>
              </div>
            </Widget>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Widget>
              <div className="text-center">
                <h4 className="text-warning">30s</h4>
                <small className="text-muted">Cập nhật biểu đồ</small>
              </div>
            </Widget>
          </Col>
        </Row>

        <div>
          <Row>
            {/* Biểu đồ nhiệt độ */}
            <Col lg={12} xs={12} className="mb-4">
              <Widget
                title={
                  <h5>
                    🌡️ <span className="fw-semi-bold">Nhiệt độ nước theo thời gian</span>
                  </h5>
                }
                close
                collapse
              >
                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Đang tải...</span>
                    </div>
                    <p className="mt-2 text-muted">Đang tải dữ liệu biểu đồ...</p>
                  </div>
                ) : (
                  <ApexChart
                    height={350}
                    series={temperatureChart.series}
                    options={temperatureChart.options}
                    type="line"
                  />
                )}
              </Widget>
            </Col>

            {/* Biểu đồ độ đục */}
            <Col lg={12} xs={12} className="mb-4">
              <Widget
                title={
                  <h5>
                    🌫️ <span className="fw-semi-bold">Độ đục nước theo thời gian</span>
                  </h5>
                }
                close
                collapse
              >
                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-warning" role="status">
                      <span className="sr-only">Đang tải...</span>
                    </div>
                  </div>
                ) : (
                  <ApexChart
                    height={350}
                    series={turbidityChart.series}
                    options={turbidityChart.options}
                    type="area"
                  />
                )}
              </Widget>
            </Col>

            {/* Biểu đồ dòng điện */}
            <Col lg={6} xs={12} className="mb-4">
              <Widget
                title={
                  <h5>
                    ⚡ <span className="fw-semi-bold">Dòng điện máy bơm theo thời gian</span>
                  </h5>
                }
                close
                collapse
              >
                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                      <span className="sr-only">Đang tải...</span>
                    </div>
                  </div>
                ) : (
                  <ApexChart
                    height={350}
                    series={currentChart.series}
                    options={currentChart.options}
                    type="line"
                  />
                )}
              </Widget>
            </Col>

            {/* Biểu đồ oxy hòa tan */}
            <Col lg={6} xs={12} className="mb-4">
              <Widget
                title={
                  <h5>
                    🫧 <span className="fw-semi-bold">Oxy hòa tan theo thời gian</span>
                  </h5>
                }
                close
                collapse
              >
                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-info" role="status">
                      <span className="sr-only">Đang tải...</span>
                    </div>
                  </div>
                ) : (
                  <ApexChart
                    height={350}
                    series={dissolvedOxygenChart.series}
                    options={dissolvedOxygenChart.options}
                    type="area"
                  />
                )}
              </Widget>
            </Col>

            {/* Biểu đồ mực nước */}
            <Col lg={6} xs={12} className="mb-4">
              <Widget
                title={
                  <h5>
                    💧 <span className="fw-semi-bold">Mực nước theo thời gian</span>
                  </h5>
                }
                close
                collapse
              >
                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-info" role="status">
                      <span className="sr-only">Đang tải...</span>
                    </div>
                  </div>
                ) : (
                  <ApexChart
                    height={350}
                    series={this.state.waterLevelChart ? this.state.waterLevelChart.series : [{ data: [] }]}
                    options={{
                      chart: { type: 'line', height: 350 },
                      stroke: { curve: 'smooth' },
                      colors: ['#007bff'],
                      xaxis: { type: 'datetime' },
                      yaxis: { title: { text: 'Mực nước (cm)' } }
                    }}
                    type="line"
                  />
                )}
              </Widget>
            </Col>

            {/* Biểu đồ tổng hợp */}
            <Col lg={12} xs={12}>
              <Widget
                title={
                  <h5>
                    📈 <span className="fw-semi-bold">Biểu đồ tổng hợp tất cả cảm biến</span>
                  </h5>
                }
                close
                collapse
              >
                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-info" role="status">
                      <span className="sr-only">Đang tải...</span>
                    </div>
                  </div>
                ) : (
                  <ApexChart
                    height={400}
                    series={[
                      {
                        name: 'Nhiệt độ (°C)',
                        data: temperatureChart.series[0].data,
                        yAxis: 0
                      },
                      {
                        name: 'Độ đục (NTU)',
                        data: turbidityChart.series[0].data,
                        yAxis: 1
                      },
                      {
                        name: 'Dòng điện (A)',
                        data: currentChart.series[0].data,
                        yAxis: 2
                      },
                      {
                        name: 'Oxy hòa tan (mg/L)',
                        data: dissolvedOxygenChart.series[0].data,
                        yAxis: 3
                      }
                      ,{
                        name: 'Mực nước (cm)',
                        data: this.state.waterLevelChart ? this.state.waterLevelChart.series[0].data : [],
                        yAxis: 4
                      }
                    ]}
                    options={{
                      chart: {
                        type: 'line',
                        height: 400,
                        zoom: {
                          enabled: true
                        }
                      },
                      stroke: {
                        curve: 'smooth',
                        width: [3, 2, 2, 2]
                      },
                      colors: ['#dc3545', '#ffc107', '#28a745', '#17a2b8'],
                      title: {
                        text: 'Tất cả cảm biến trên cùng biểu đồ',
                        align: 'left'
                      },
                      xaxis: {
                        type: 'datetime',
                        title: {
                          text: 'Thời gian'
                        }
                      },
                      yaxis: [
                        {
                          title: {
                            text: 'Nhiệt độ (°C)'
                          },
                          seriesName: 'Nhiệt độ (°C)'
                        },
                        {
                          opposite: true,
                          title: {
                            text: 'Độ đục (NTU)'
                          },
                          seriesName: 'Độ đục (NTU)'
                        },
                        {
                          opposite: false,
                          title: {
                            text: 'Dòng điện (A)'
                          },
                          seriesName: 'Dòng điện (A)'
                        },
                        {
                          opposite: true,
                          title: {
                            text: 'Oxy hòa tan (mg/L)'
                          },
                          seriesName: 'Oxy hòa tan (mg/L)'
                        }
                        ,{
                          opposite: false,
                          title: { text: 'Mực nước (cm)' },
                          seriesName: 'Mực nước (cm)'
                        }
                      ],
                      tooltip: {
                        x: {
                          format: 'dd/MM/yy HH:mm'
                        }
                      },
                      legend: {
                        position: 'top'
                      }
                    }}
                    type="line"
                  />
                )}
              </Widget>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default Charts;
