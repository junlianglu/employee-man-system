import { Row, Col, Input, Form } from 'antd';

export default function ContactForm({ includeWorkPhone = true }) {
  return (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item
          name="cellPhone"
          label="Cell Phone"
          rules={[
            { required: true, message: 'Cell phone is required' },
            { pattern: /^\+?\d[\d\s\-()]{7,}$/, message: 'Invalid phone number' },
          ]}
        >
          <Input placeholder="+1 555 123 4567" />
        </Form.Item>
      </Col>
      {includeWorkPhone && (
        <Col xs={24} md={12}>
          <Form.Item
            name="workPhone"
            label="Work Phone"
            rules={[{ pattern: /^\+?\d[\d\s\-()]{7,}$/, message: 'Invalid phone number' }]}
          >
            <Input placeholder="+1 555 987 6543" />
          </Form.Item>
        </Col>
      )}
    </Row>
  );
}