import { Form, Input, Button, Space, Row, Col } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

export default function EmergencyContactForm({ name = 'emergencyContacts', min = 1, max = 3 }) {
  return (
    <Form.List name={name}>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name: itemName, ...restField }, index) => (
            <Space
              key={key}
              direction="vertical"
              style={{ display: 'block', marginBottom: 16, width: '100%' }}
            >
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    {...restField}
                    name={[itemName, 'firstName']}
                    label={`Contact ${index + 1} First Name`}
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input placeholder="First name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    {...restField}
                    name={[itemName, 'lastName']}
                    label="Last Name"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input placeholder="Last name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    {...restField}
                    name={[itemName, 'relationship']}
                    label="Relationship"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input placeholder="e.g., Spouse, Parent, Friend" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    {...restField}
                    name={[itemName, 'phone']}
                    label="Phone"
                    rules={[
                      { required: true, message: 'Required' },
                      { pattern: /^\+?\d[\d\s\-()]{7,}$/, message: 'Invalid phone number' },
                    ]}
                  >
                    <Input placeholder="+1 555 555 5555" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    {...restField}
                    name={[itemName, 'email']}
                    label="Email"
                    rules={[{ type: 'email', message: 'Invalid email' }]}
                  >
                    <Input placeholder="name@example.com" />
                  </Form.Item>
                </Col>
              </Row>
              <div>
                <Button
                  danger
                  type="text"
                  icon={<MinusCircleOutlined />}
                  onClick={() => remove(itemName)}
                  disabled={fields.length <= min}
                >
                  Remove this contact
                </Button>
              </div>
            </Space>
          ))}
          <Form.Item
            shouldUpdate
            rules={[
              {
                validator: async (_, value) => {
                  if (!value || value.length < min) {
                    return Promise.reject(new Error(`At least ${min} contact(s) required`));
                  }
                },
              },
            ]}
          >
            {() => (
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                disabled={fields.length >= max}
              >
                Add emergency contact
              </Button>
            )}
          </Form.Item>
        </>
      )}
    </Form.List>
  );
}