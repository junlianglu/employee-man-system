import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Space, Row, Col, message, Typography, Popconfirm } from 'antd';
import { EditOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProfile, updateMyProfileThunk } from '../../../features/employee/employeeThunks.js';
import { selectMyProfile, selectMyProfileStatus, selectMyProfileUpdateStatus } from '../../../features/employee/employeeSelectors.js';

const { Text } = Typography;

export default function EmergencyContactSection() {
  const dispatch = useDispatch();
  const profile = useSelector(selectMyProfile);
  const loading = useSelector(selectMyProfileStatus) === 'loading';
  const saving = useSelector(selectMyProfileUpdateStatus) === 'loading';

  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    if (!profile) dispatch(fetchMyProfile());
  }, [dispatch, profile]);

  useEffect(() => {
    if (profile && !isEditing) {
      const values = {
        emergencyContacts:
          profile.emergencyContacts?.length
            ? profile.emergencyContacts
            : [{ firstName: '', lastName: '', relationship: '' }],
      };
      form.setFieldsValue(values);
      setInitialValues(values);
    }
  }, [profile, form, isEditing]);

  const handleEdit = () => {
    // Capture current form values as initial values before editing
    const currentValues = form.getFieldsValue();
    setInitialValues(currentValues);
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset form to initial values
    if (initialValues) {
      form.resetFields();
      form.setFieldsValue(initialValues);
    } else {
      // Fallback: reload from profile
      if (profile) {
        const values = {
          emergencyContacts:
            profile.emergencyContacts?.length
              ? profile.emergencyContacts
              : [{ firstName: '', lastName: '', relationship: '' }],
        };
        form.resetFields();
        form.setFieldsValue(values);
      } else {
        form.resetFields();
      }
    }
    setIsEditing(false);
  };

  const onFinish = async (values) => {
    const contacts = (values.emergencyContacts || []).filter(Boolean);
    const res = await dispatch(updateMyProfileThunk({ emergencyContacts: contacts }));
    if (res.error) {
      message.error(res.error.message || 'Failed to save');
    } else {
      message.success('Saved');
      setIsEditing(false);
      setInitialValues(form.getFieldsValue());
    }
  };

  if (loading) {
    return <Card title="Emergency Contacts" loading bordered={false} />;
  }

  const contacts = profile?.emergencyContacts || [];

  return (
    <Card
      title="Emergency Contacts"
      bordered={false}
      extra={
        !isEditing ? (
          <Button icon={<EditOutlined />} onClick={handleEdit}>
            Edit
          </Button>
        ) : (
          <Space>
            <Popconfirm
              title="Discard changes?"
              description="Are you sure you want to discard all your changes?"
              onConfirm={handleCancel}
              okText="Yes"
              cancelText="No"
              okType="danger"
            >
              <Button type="button" disabled={saving}>
                Cancel
              </Button>
            </Popconfirm>
            <Button type="primary" onClick={() => form.submit()} loading={saving}>
              Save
            </Button>
          </Space>
        )
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish} disabled={!isEditing}>
        {!isEditing ? (
          <>
            {contacts.length === 0 ? (
              <Text type="secondary">No emergency contacts added.</Text>
            ) : (
              contacts.map((contact, index) => (
                <Card
                  key={index}
                  type="inner"
                  title={`Contact ${index + 1}`}
                  style={{ marginBottom: 12 }}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <div>
                        <Text type="secondary">First Name</Text>
                        <div><Text strong>{contact.firstName || 'N/A'}</Text></div>
                      </div>
                    </Col>
                    <Col xs={24} md={8}>
                      <div>
                        <Text type="secondary">Middle Name</Text>
                        <div><Text strong>{contact.middleName || 'N/A'}</Text></div>
                      </div>
                    </Col>
                    <Col xs={24} md={8}>
                      <div>
                        <Text type="secondary">Last Name</Text>
                        <div><Text strong>{contact.lastName || 'N/A'}</Text></div>
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col xs={24} md={8}>
                      <div>
                        <Text type="secondary">Relationship</Text>
                        <div><Text strong>{contact.relationship || 'N/A'}</Text></div>
                      </div>
                    </Col>
                    <Col xs={24} md={8}>
                      <div>
                        <Text type="secondary">Phone</Text>
                        <div><Text strong>{contact.phone || 'N/A'}</Text></div>
                      </div>
                    </Col>
                    <Col xs={24} md={8}>
                      <div>
                        <Text type="secondary">Email</Text>
                        <div><Text strong>{contact.email || 'N/A'}</Text></div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))
            )}
          </>
        ) : (
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
                        <Button danger size="small" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)}>
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
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Contact
                  </Button>
                </Space>
              </>
            )}
          </Form.List>
        )}
      </Form>
    </Card>
  );
}
