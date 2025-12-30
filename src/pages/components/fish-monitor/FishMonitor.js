import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Space, Typography, Select, Tag, Switch, Button, message } from 'antd';

const { Title, Text } = Typography;

const API_BASE = 'http://localhost/aquabox/upload_image.php';

const fetchAll = async () => {
  const res = await fetch(`${API_BASE}?action=all`, { method: 'GET' });
  if (!res.ok) {
    const t = await res.text().catch(()=> '');
    throw new Error(`${res.status} ${res.statusText} - ${t}`);
  }
  return res.json();
};

function safeParseJSON(str) {
  try { return JSON.parse(str); } catch { return null; }
}

export default function FishSummary() {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [device, setDevice] = useState('all');
  const [auto, setAuto] = useState(false);

  // load
  const loadData = async (silent=false) => {
    if (!silent) setLoading(true);
    try {
      const json = await fetchAll();
      const list = Array.isArray(json?.data) ? json.data : [];
      setRaw(list);
      if (!silent) message.success(`Đã tải ${list.length} bản ghi`);
    } catch (e) {
      message.error(`Lỗi tải: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => loadData(true), 5000);
    return () => clearInterval(id);
  }, [auto]);

  // unique devices
  const devices = useMemo(() => {
    const set = new Set(raw.map(r => r.device_id).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [raw]);

  // data for table (filter by device)
  const data = useMemo(() => {
    const rows = (raw || []).map((r, idx) => {
      const aiJson = r.ai_result_json ? safeParseJSON(r.ai_result_json) : null;
      const annotated = aiJson?.annotated_path || null;
      return {
        key: (r.id !== undefined && r.id !== null) ? r.id : idx,
        id: r.id,
        device_id: r.device_id,
        created_at: r.created_at,
        alive: Number(r.ai_alive_count != null ? r.ai_alive_count : 0),
        dead: Number(r.ai_dead_count != null ? r.ai_dead_count : 0),
        status: r.ai_status || 'pending',
        local_path: r.local_path,
        annotated_path: annotated,
        conf_avg: r.ai_conf_avg,
      };
    });
    if (device !== 'all') return rows.filter(r => r.device_id === device);
    return rows;
  }, [raw, device]);

  const columns = [
    {
      title: 'Thiết bị',
      dataIndex: 'device_id',
      key: 'device',
  render: v => <Space>📷{v}</Space>,
      sorter: (a,b) => (a.device_id||'').localeCompare(b.device_id||'')
    },
    {
      title: 'Giờ ghi',
      dataIndex: 'created_at',
      key: 'time',
      render: v => <Text>{v}</Text>,
      sorter: (a,b) => new Date(a.created_at) - new Date(b.created_at),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Cá sống',
      dataIndex: 'alive',
      key: 'alive',
      render: v => <Tag color="green">{v}</Tag>,
      sorter: (a,b) => a.alive - b.alive,
      width: 110
    },
    {
      title: 'Cá chết',
      dataIndex: 'dead',
      key: 'dead',
      render: v => <Tag color="red">{v}</Tag>,
      sorter: (a,b) => a.dead - b.dead,
      width: 110
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: s => {
        const color = s === 'done' ? 'blue' : s === 'error' ? 'red' : 'orange';
        return <Tag color={color}>{s}</Tag>;
      },
      width: 120
    },
    {
      title: 'Ảnh',
      key: 'img',
      render: (_, row) => (
        <Space>
          {row.local_path && (
            <a href={`http://localhost/aquabox/${row.local_path}`} target="_blank" rel="noreferrer">
              🖼️ Gốc
            </a>
          )}
          {row.annotated_path && (
            <a href={`http://localhost/aquabox/${row.annotated_path}`} target="_blank" rel="noreferrer">
              🖼️ Annotated
            </a>
          )}
        </Space>
      ),
      width: 200
    },
  ];

  // quick KPIs (theo filter)
  const totals = useMemo(() => {
    let alive = 0, dead = 0;
    data.forEach(r => { alive += r.alive; dead += r.dead; });
    return { alive, dead };
  }, [data]);

  return (
    <div style={{ padding: 12 }}>



      <Card>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={{ pageSize: 20, showSizeChanger: true }}
          rowKey="id"
        />
      </Card>
    </div>
  );
}
