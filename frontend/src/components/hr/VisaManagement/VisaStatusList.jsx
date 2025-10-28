import { useMemo } from 'react';
import { Card, Form, Row, Col, Input, Select, Button, Table, Tag, Space, Typography } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

function citizenshipTag(c) {
  if (c === 'work_visa') return <Tag color="blue">Work Visa</Tag>;
  if (c === 'permanent_resident') return <Tag color="green">Permanent Resident</Tag>;
  if (c === 'citizen') return <Tag color="green">U.S. Citizen</Tag>;
  return <Tag>Unknown</Tag>;
}

function daysLeft(visaEndDate) {
  if (!visaEndDate) return null;
  return dayjs(visaEndDate).diff(dayjs(), 'day');
}

export default function VisaStatusList({
  items = [],
  loading = false,
  pagination,
  onChangePage,
  onSearch,
  onViewDocuments,
  defaultFilter = { search: '', status: undefined },
}) {
  const [form] = Form.useForm();

  const columns = useMemo(() => [
    {
      title: 'Name',
      key: 'name',
      render: (_, r) => r.preferredName || `${r.firstName || ''} ${r.lastName || ''}`.trim() || r.username,
      ellipsis: true,
    },
    { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true },
    {
      title: 'Citizenship',
      dataIndex: 'citizenshipStatus',
      key: 'citizenshipStatus',
      render: (v) => citizenshipTag(v),
    },
    {
      title: 'Work Auth',
      dataIndex: 'workAuthorizationType',
      key: 'workAuthorizationType',
      render: (v) => v || '—',
    },
    {
      title: 'Visa Validity',
      key: 'validity',
      render: (_, r) =>
        r.visaStartDate || r.visaEndDate
          ? `${r.visaStartDate ? dayjs(r.visaStartDate).format('YYYY-MM-DD') : '—'} → ${r.visaEndDate ? dayjs(r.visaEndDate).format('YYYY-MM-DD') : '—'}`
          : '—',
    },
    {
      title: 'Days Left',
      key: 'days',
      render: (_, r) => {
        const d = daysLeft(r.visaEndDate);
        if (d === null) return '—';
        return (
          <Typography.Text type={d <= 30 ? 'danger' : d <= 90 ? 'warning' : undefined}>
            {d}
          </Typography.Text>
        );
      },
      sorter: (a, b) => (daysLeft(a.visaEndDate) ?? Number.MAX_SAFE_INTEGER) - (daysLeft(b.visaEndDate) ?? Number.MAX_SAFE_INTEGER),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, r) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => onViewDocuments?.(r._id)}>
          Documents
        </Button>
      ),
    },
  ], [onViewDocuments]);

  const handleFinish = (vals) => {
    const cleaned = Object.fromEntries(
      Object.entries(vals).filter(([_, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    );
    onSearch?.(cleaned);
  };

  return (
    <Card title="Visa Status">
      <Form
        layout="vertical"
        form={form}
        initialValues={defaultFilter}
        onFinish={handleFinish}
        style={{ marginBottom: 16 }}
      >
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item name="search" label="Search">
              <Input placeholder="Name, email or username" allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="status" label="Citizenship/Work Auth">
              <Select allowClear placeholder="All">
                <Select.Option value="citizen">U.S. Citizen</Select.Option>
                <Select.Option value="permanent_resident">Permanent Resident</Select.Option>
                <Select.Option value="work_visa">Work Visa</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={4} style={{ display: 'flex', alignItems: 'end' }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => { form.resetFields(); onSearch?.({}); }}>
                Reset
              </Button>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                Search
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>

      <Table
        rowKey={(r) => r._id}
        columns={columns}
        dataSource={items}
        loading={loading}
        pagination={pagination ? {
          current: pagination.page || 1,
          pageSize: pagination.limit || 10,
          total: pagination.total || 0,
          showSizeChanger: false,
          onChange: onChangePage,
        } : false}
      />
    </Card>
  );
}