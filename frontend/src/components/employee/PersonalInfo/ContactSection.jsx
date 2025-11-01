import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Space, Row, Col, Typography, message, Popconfirm } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProfile, updateMyProfileThunk } from '../../../features/employee/employeeThunks.js';
import { selectMyProfile, selectMyProfileStatus, selectMyProfileUpdateStatus } from '../../../features/employee/employeeSelectors.js';

const { Text } = Typography;

export default function ContactSection() {
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
        cellPhone: profile.cellPhone,
        workPhone: profile.workPhone,
        email: profile.email,
      };
      form.setFieldsValue(values);
      setInitialValues(values);
    }
  }, [profile, form, isEditing]);

  const handleEdit = () => {
    const currentValues = form.getFieldsValue();
    setInitialValues(currentValues);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (initialValues) {
      form.resetFields();
      form.setFieldsValue(initialValues);
    } else {
      if (profile) {
        const values = {
          cellPhone: profile.cellPhone,
          workPhone: profile.workPhone,
          email: profile.email,
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
    const updateData = {
      cellPhone: values.cellPhone,
      workPhone: values.workPhone,
    };
    const res = await dispatch(updateMyProfileThunk(updateData));
    if (res.error) {
      message.error(res.error.message || 'Failed to save');
    } else {
      message.success('Saved');
      setIsEditing(false);
      setInitialValues(form.getFieldsValue());
    }
  };

  if (loading) {
    return <Card title="Contact" loading bordered={false} />;
  }

  return (
    <Card
      title="Contact Info"
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
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <div>
                <Text type="secondary">Cell Phone</Text>
                <div><Text strong>{profile?.cellPhone || 'N/A'}</Text></div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div>
                <Text type="secondary">Work Phone</Text>
                <div><Text strong>{profile?.workPhone || 'N/A'}</Text></div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div>
                <Text type="secondary">Email</Text>
                <div><Text strong>{profile?.email || 'N/A'}</Text></div>
                <Text type="secondary" style={{ fontSize: '12px' }}>Email is managed by the system.</Text>
              </div>
            </Col>
          </Row>
        ) : (
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Cell Phone"
              name="cellPhone"
              rules={[{ required: true, message: 'Cell phone is required' }]}
            >
              <Input placeholder="(555) 555-5555" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Work Phone" name="workPhone">
              <Input placeholder="(555) 555-5555" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Email" name="email">
              <Input disabled />
            </Form.Item>
            <Text type="secondary">Email is managed by the system.</Text>
          </Col>
        </Row>
        )}
      </Form>
    </Card>
  );
}
