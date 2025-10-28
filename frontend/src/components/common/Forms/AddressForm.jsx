import { Row, Col, Input, Form } from 'antd';

export default function AddressForm({ name = 'address', required = true, label = 'Address' }) {
  const req = required ? [{ required: true, message: 'Required' }] : [];
  return (
    <div>
      <Row gutter={16}>
        <Col xs={24}>
          <Form.Item
            name={[name, 'street']}
            label={`${label} Street`}
            rules={[...req, { max: 120, message: 'Max 120 characters' }]}
          >
            <Input placeholder="123 Main St Apt 4B" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={10}>
          <Form.Item
            name={[name, 'city']}
            label="City"
            rules={[...req, { max: 60, message: 'Max 60 characters' }]}
          >
            <Input placeholder="City" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name={[name, 'state']}
            label="State"
            rules={[...req, { len: 2, message: 'Use 2-letter code (e.g., CA)' }]}
          >
            <Input placeholder="CA" maxLength={2} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item
            name={[name, 'zip']}
            label="ZIP"
            rules={[
              ...req,
              { pattern: /^\d{5}(-\d{4})?$/, message: 'Invalid ZIP (12345 or 12345-6789)' },
            ]}
          >
            <Input placeholder="12345" />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
}