import { Row, Col, Form, Input } from 'antd';

export default function ReferenceForm({ name = 'reference' }) {
  return (
    <>
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
            name={[name, 'middleName']}
            label="Middle Name"
            rules={[{ max: 60 }]}
          >
            <Input placeholder="Optional" />
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
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item
            name={[name, 'relationship']}
            label="Relationship"
            rules={[{ required: true, message: 'Required' }, { max: 80 }]}
          >
            <Input placeholder="e.g., Manager, Colleague" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name={[name, 'phone']}
            label="Phone"
            rules={[{ pattern: /^\+?\d[\d\s\-()]{7,}$/, message: 'Invalid phone number' }]}
          >
            <Input placeholder="+1 555 555 5555" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name={[name, 'email']}
            label="Email"
            rules={[{ type: 'email', message: 'Invalid email' }]}
          >
            <Input placeholder="name@example.com" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}

