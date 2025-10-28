import { useMemo } from 'react';
import { Card, Form, Input, Button, Row, Col, Space, Typography, Divider, Tag, message } from 'antd';
import { SendOutlined, CopyOutlined, ReloadOutlined, LinkOutlined, FieldTimeOutlined } from '@ant-design/icons';

export default function TokenGenerator({
  loading = false,
  onGenerate,
  lastToken,
  onReset,
}) {
  const [form] = Form.useForm();

  const statusTag = useMemo(() => {
    if (!lastToken) return null;
    if (lastToken.submittedAt) return <Tag color="green">Used</Tag>;
    const expired = lastToken.expiresAt && new Date(lastToken.expiresAt) < new Date();
    return <Tag color={expired ? 'red' : 'blue'}>{expired ? 'Expired' : 'Active'}</Tag>;
  }, [lastToken]);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('Copied to clipboard');
    } catch {
      message.error('Copy failed');
    }
  };

  const onFinish = async (values) => {
    await onGenerate?.(values);
    form.resetFields();
  };

  return (
    <Card title="Invite Candidate" extra={onReset ? <Button icon={<ReloadOutlined />} onClick={onReset}>Reset</Button> : null}>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: 'Email is required' }, { type: 'email' }]}
            >
              <Input placeholder="candidate@example.com" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'First name is required' }]}
            >
              <Input placeholder="First name" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item name="middleName" label="Middle Name" rules={[{ max: 60 }]}>
              <Input placeholder="Optional" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Last name is required' }]}
            >
              <Input placeholder="Last name" />
            </Form.Item>
          </Col>
        </Row>
        <Row justify="end">
          <Col>
            <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading}>
              Send Invite
            </Button>
          </Col>
        </Row>
      </Form>

      {lastToken && (
        <>
          <Divider />
          <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              Latest Token {statusTag}
            </Typography.Title>
            <Space wrap>
              <Typography.Text strong>Email:</Typography.Text>
              <Typography.Text>{lastToken.email}</Typography.Text>
            </Space>
            <Space wrap>
              <Typography.Text strong>Name:</Typography.Text>
              <Typography.Text>
                {lastToken.firstName} {lastToken.middleName ? `${lastToken.middleName} ` : ''}{lastToken.lastName}
              </Typography.Text>
            </Space>
            <Space wrap>
              <Typography.Text strong>Token:</Typography.Text>
              <Typography.Text code>{lastToken.token}</Typography.Text>
              <Button size="small" icon={<CopyOutlined />} onClick={() => handleCopy(lastToken.token)}>Copy</Button>
            </Space>
            <Space wrap>
              <Typography.Text strong>Registration Link:</Typography.Text>
              <Typography.Link href={lastToken.registrationLink} target="_blank">
                <LinkOutlined /> Open
              </Typography.Link>
              <Button size="small" icon={<CopyOutlined />} onClick={() => handleCopy(lastToken.registrationLink)}>Copy</Button>
            </Space>
            <Space wrap>
              <Typography.Text strong><FieldTimeOutlined /> Expires:</Typography.Text>
              <Typography.Text>
                {lastToken.expiresAt ? new Date(lastToken.expiresAt).toLocaleString() : '—'}
              </Typography.Text>
            </Space>
          </Space>
        </>
      )}
    </Card>
  );
}