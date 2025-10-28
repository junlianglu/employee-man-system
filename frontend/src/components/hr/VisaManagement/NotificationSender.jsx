import { Card, Form, Row, Col, Select, Input, Button, Space } from 'antd';
import { SendOutlined, ReloadOutlined } from '@ant-design/icons';

export default function NotificationSender({
  employees = [],
  loading = false,
  onSearchEmployees,
  onSend,
}) {
  const [form] = Form.useForm();

  const handleFinish = async (vals) => {
    await onSend?.({ employeeId: vals.employeeId, message: vals.message?.trim() || '' });
    form.resetFields(['message']);
  };

  return (
    <Card title="Send Reminder">
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item name="employeeId" label="Employee" rules={[{ required: true, message: 'Select an employee' }]}>
              <Select
                showSearch
                placeholder="Search employee"
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={(employees || []).map((e) => ({
                  value: e._id,
                  label: `${e.firstName || ''} ${e.lastName || ''} (@${e.username}) - ${e.email}`,
                }))}
                onSearch={onSearchEmployees}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="message" label="Message (optional)" rules={[{ max: 500 }]}>
              <Input.TextArea rows={3} placeholder="Add a short note (optional)" />
            </Form.Item>
          </Col>
        </Row>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => form.resetFields()}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading}>
            Send
          </Button>
        </Space>
      </Form>
    </Card>
  );
}