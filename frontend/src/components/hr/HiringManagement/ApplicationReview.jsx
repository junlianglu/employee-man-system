import { Card, List, Tag, Typography, Space, Button, Form, Select } from 'antd';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';

function statusTag(status) {
  const map = {
    approved: { color: 'green', text: 'Approved' },
    pending: { color: 'gold', text: 'Pending' },
    rejected: { color: 'red', text: 'Rejected' },
    never_submitted: { color: 'default', text: 'Never Submitted' },
  };
  const s = map[status] || { color: 'default', text: 'Unknown' };
  return <Tag color={s.color}>{s.text}</Tag>;
}

export default function ApplicationReview({
  applications = [],
  listLoading = false,
  filter = { status: 'pending' },
  onChangeFilter,
  onRefreshList,
}) {

  const listHeader = (
    <Space>
      <Typography.Text strong>Applications</Typography.Text>
      <Form layout="inline" initialValues={filter} onValuesChange={(_, all) => onChangeFilter?.(all)}>
        <Form.Item name="status" style={{ marginBottom: 0 }}>
          <Select style={{ width: 180 }}>
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="approved">Approved</Select.Option>
            <Select.Option value="rejected">Rejected</Select.Option>
          </Select>
        </Form.Item>
      </Form>
      <Button icon={<ReloadOutlined />} onClick={onRefreshList} />
    </Space>
  );

  return (
        <Card title={listHeader} bodyStyle={{ paddingTop: 0 }}>
          <List
            loading={listLoading}
            dataSource={applications}
            rowKey={(r) => r._id}
            renderItem={(e) => (
              <List.Item
                actions={[
              <Button 
                type="link" 
                icon={<EyeOutlined />} 
                onClick={() => {
                  window.open(`/hr/hiring/review/${e._id}`, '_blank', 'noopener,noreferrer');
                }}
              >
                View Application
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Typography.Text strong>
                        {e.firstName} {e.lastName}
                      </Typography.Text>
                      {statusTag(e.onboardingReview?.status)}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Typography.Text type="secondary">{e.email}</Typography.Text>
                      <Typography.Text type="secondary">{e.username}</Typography.Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
  );
}