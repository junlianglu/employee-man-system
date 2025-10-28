import { useMemo } from 'react';
import { Card, Row, Col, List, Tag, Typography, Space, Button, Skeleton, Divider, Form, Select, Input } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';

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
  onSelectApplication,
  detail,
  detailLoading = false,
  onApprove,
  onReject,
}) {
  const [form] = Form.useForm();

  const detailName = useMemo(() => {
    if (!detail) return '';
    return detail.preferredName || `${detail.firstName || ''} ${detail.lastName || ''}`.trim();
  }, [detail]);

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
    <Row gutter={16}>
      <Col xs={24} md={10}>
        <Card title={listHeader} bodyStyle={{ paddingTop: 0 }}>
          <List
            loading={listLoading}
            dataSource={applications}
            rowKey={(r) => r._id}
            renderItem={(e) => (
              <List.Item
                actions={[
                  <Button type="link" icon={<EyeOutlined />} onClick={() => onSelectApplication?.(e._id)}>
                    View
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
                      <Typography.Text type="secondary">@{e.username}</Typography.Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>

      <Col xs={24} md={14}>
        <Card title="Application Detail">
          {detailLoading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : detail ? (
            <>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space wrap>
                  <Typography.Title level={4} style={{ margin: 0 }}>{detailName || detail.username}</Typography.Title>
                  {statusTag(detail.onboardingReview?.status)}
                </Space>
                <Typography.Text type="secondary">{detail.email}</Typography.Text>
                <Typography.Text type="secondary">@{detail.username}</Typography.Text>
              </Space>

              <Divider />

              <Row gutter={12}>
                <Col xs={24} md={12}>
                  <Typography.Text strong>Citizenship</Typography.Text>
                  <div>{detail.citizenshipStatus || '—'}</div>
                </Col>
                <Col xs={24} md={12}>
                  <Typography.Text strong>Work Authorization</Typography.Text>
                  <div>{detail.workAuthorizationType || '—'}</div>
                </Col>
              </Row>

              <Divider />

              <Form
                layout="vertical"
                form={form}
                onFinish={async (vals) => {
                  if (vals.decision === 'approved') {
                    await onApprove?.({ employeeId: detail._id, hrFeedback: vals.hrFeedback?.trim() || '' });
                  } else {
                    await onReject?.({ employeeId: detail._id, hrFeedback: vals.hrFeedback?.trim() || '' });
                  }
                  form.resetFields();
                }}
                initialValues={{ decision: 'approved', hrFeedback: '' }}
              >
                <Row gutter={12}>
                  <Col xs={24} md={10}>
                    <Form.Item name="decision" label="Decision" rules={[{ required: true }]}>
                      <Select>
                        <Select.Option value="approved">Approve</Select.Option>
                        <Select.Option value="rejected">Reject</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={14}>
                    <Form.Item
                      noStyle
                      shouldUpdate={(p, c) => p.decision !== c.decision}
                    >
                      {({ getFieldValue }) => {
                        const isReject = getFieldValue('decision') === 'rejected';
                        return (
                          <Form.Item
                            name="hrFeedback"
                            label="Feedback"
                            rules={[{ required: isReject, message: 'Feedback is required when rejecting' }, { max: 500 }]}
                          >
                            <Input.TextArea rows={3} placeholder={isReject ? 'Reason for rejection' : 'Optional notes'} />
                          </Form.Item>
                        );
                      }}
                    </Form.Item>
                  </Col>
                </Row>

                <Space>
                  <Button htmlType="submit" type="primary" icon={<CheckOutlined />}>
                    Submit
                  </Button>
                  <Button onClick={() => form.resetFields()} icon={<CloseOutlined />}>
                    Clear
                  </Button>
                </Space>
              </Form>
            </>
          ) : (
            <Typography.Text type="secondary">Select an application from the list.</Typography.Text>
          )}
        </Card>
      </Col>
    </Row>
  );
}