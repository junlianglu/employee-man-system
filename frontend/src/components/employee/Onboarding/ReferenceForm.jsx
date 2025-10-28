import { Row, Col, Form, Input } from 'antd';

export default function ReferenceForm({ name = 'reference' }) {
  return (
    <Row gutter={16}>
      <Col xs={24} md={8}>
        <Form.Item
          name={[name, 'firstName']}
          label="Reference First Name"
          rules={[{ required: true, message: 'Required' }, { max: 60 }]}
        >
          <Input placeholder="First name" />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item
          name={[name, 'lastName']}
          label="Reference Last Name"
          rules={[{ required: true, message: 'Required' }, { max: 60 }]}
        >
          <Input placeholder="Last name" />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item
          name={[name, 'relationship']}
          label="Relationship"
          rules={[{ required: true, message: 'Required' }, { max: 80 }]}
        >
          <Input placeholder="e.g., Manager, Colleague" />
        </Form.Item>
      </Col>
    </Row>
  );
}

