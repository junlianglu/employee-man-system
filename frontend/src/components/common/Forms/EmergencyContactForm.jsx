import { Form, Input, Button, Space, Row, Col } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

export default function EmergencyContactForm({ name = 'emergencyContacts', min = 1, max = 3, readOnly: propReadOnly }) {
  const form = Form.useFormInstance();
  const isReadOnly = propReadOnly !== undefined ? propReadOnly : (form?.disabled || false);

  return (
    <Form.List 
      name={name}
      rules={[
        {
          validator: async (_, contacts) => {
            if (!contacts || contacts.length < min) {
              return Promise.reject(new Error(`At least ${min} emergency contact(s) required`));
            }
          },
        },
      ]}
    >
      {(fields, { add, remove }, { errors }) => (
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
                    name={[itemName, 'middleName']}
                    label="Middle Name"
                  >
                    <Input placeholder="Optional" />
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
              </Row>
              <Row gutter={16}>
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
                <Col xs={24} md={8}>
                  <Form.Item
                    {...restField}
                    name={[itemName, 'phone']}
                    label="Phone"
                    rules={[
                      { pattern: /^\+?\d[\d\s\-()]{7,}$/, message: 'Invalid phone number' },
                    ]}
                  >
                    <Input placeholder="Optional" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    {...restField}
                    name={[itemName, 'email']}
                    label="Email"
                    rules={[{ type: 'email', message: 'Invalid email' }]}
                  >
                    <Input placeholder="Optional" />
                  </Form.Item>
                </Col>
              </Row>
              {!isReadOnly && (
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
              )}
            </Space>
          ))}
          {!isReadOnly && (
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
          <Form.ErrorList errors={errors} />
        </>
      )}
    </Form.List>
  );
}