import React, { useEffect } from 'react';
import { Card, Form, Input, Button, Space, Row, Col, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProfile, updateMyProfileThunk } from '../../../features/employee/employeeThunks.js';
import { selectMyProfile, selectMyProfileStatus, selectMyProfileUpdateStatus } from '../../../features/employee/employeeSelectors.js';

export default function EmergencyContactSection() {
  const dispatch = useDispatch();
  const profile = useSelector(selectMyProfile);
  const loading = useSelector(selectMyProfileStatus) === 'loading';
  const saving = useSelector(selectMyProfileUpdateStatus) === 'loading';

  const [form] = Form.useForm();

  useEffect(() => {
    if (!profile) dispatch(fetchMyProfile());
  }, [dispatch, profile]);

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        emergencyContacts:
          profile.emergencyContacts?.length
            ? profile.emergencyContacts
            : [{ firstName: '', lastName: '', relationship: '' }],
      });
    }
  }, [profile, form]);

  const onFinish = async (values) => {
    const contacts = (values.emergencyContacts || []).filter(Boolean);
    const res = await dispatch(updateMyProfileThunk({ emergencyContacts: contacts }));
    if (res.error) {
      message.error(res.error.message || 'Failed to save');
    } else {
      message.success('Saved');
    }
  };

  return (
    <Card title="Emergency Contacts" loading={loading} bordered={false}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.List name="emergencyContacts">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Card
                  key={field.key}
                  type="inner"
                  title={`Contact ${field.name + 1}`}
                  style={{ marginBottom: 12 }}
                  extra={
                    fields.length > 1 && (
                      <Button danger size="small" onClick={() => remove(field.name)}>
                        Remove
                      </Button>
                    )
                  }
                >
                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'firstName']}
                        label="First Name"
                        rules={[{ required: true, message: 'First name is required' }]}
                      >
                        <Input placeholder="First name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'middleName']}
                        label="Middle Name"
                      >
                        <Input placeholder="Middle name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'lastName']}
                        label="Last Name"
                        rules={[{ required: true, message: 'Last name is required' }]}
                      >
                        <Input placeholder="Last name" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'relationship']}
                        label="Relationship"
                        rules={[{ required: true, message: 'Relationship is required' }]}
                      >
                        <Input placeholder="Relationship" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'phone']}
                        label="Phone"
                      >
                        <Input placeholder="(555) 555-5555" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'email']}
                        label="Email"
                        rules={[{ type: 'email', message: 'Invalid email' }]}
                      >
                        <Input placeholder="email@example.com" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}

              <Space style={{ marginBottom: 16 }}>
                <Button type="dashed" onClick={() => add()} block>
                  Add Contact
                </Button>
              </Space>
            </>
          )}
        </Form.List>

        <Space>
          <Button type="primary" htmlType="submit" loading={saving}>Save</Button>
          <Button onClick={() => form.resetFields()} disabled={saving}>Reset</Button>
        </Space>
      </Form>
    </Card>
  );
}