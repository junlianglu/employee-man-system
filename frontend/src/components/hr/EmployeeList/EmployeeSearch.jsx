import { Form, Input, Row, Col, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

export default function EmployeeSearch({ initial = {}, onSearch }) {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    const cleaned = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    );
    onSearch?.(cleaned);
  };

  return (
    <Form
      layout="vertical"
      form={form}
      initialValues={initial}
      onFinish={handleFinish}
      style={{ marginBottom: 16 }}
    >
      <Row gutter={12}>
        <Col xs={24} md={18}>
          <Form.Item name="search" label="Search">
            <Input placeholder="Name, email or username" allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={6} style={{ display: 'flex', alignItems: 'end' }}>
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
  );
}