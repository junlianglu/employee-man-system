import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Space, Row, Col, message, Typography, Popconfirm } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProfile, updateMyProfileThunk } from '../../../features/employee/employeeThunks.js';
import { selectMyProfile, selectMyProfileStatus, selectMyProfileUpdateStatus } from '../../../features/employee/employeeSelectors.js';

const { Text } = Typography;

export default function AddressSection() {
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
    if (profile?.address && !isEditing) {
      const values = {
        address: {
          street: profile.address.street,
          unit: profile.address.unit,
          city: profile.address.city,
          state: profile.address.state,
          zip: profile.address.zip,
        },
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
      if (profile?.address) {
        const values = {
          address: {
            street: profile.address.street,
            unit: profile.address.unit,
            city: profile.address.city,
            state: profile.address.state,
            zip: profile.address.zip,
          },
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
    const updateData = { address: values.address };
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
    return <Card title="Address" loading bordered={false} />;
  }

  const address = profile?.address;

  return (
    <Card
      title="Address"
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
            <Col xs={24}>
              <div>
                <Text type="secondary">Street</Text>
                <div><Text strong>{address?.street || 'N/A'}</Text></div>
              </div>
            </Col>
            <Col xs={24} style={{ marginTop: 16 }}>
              <div>
                <Text type="secondary">Unit</Text>
                <div><Text strong>{address?.unit || 'N/A'}</Text></div>
              </div>
            </Col>
            <Col xs={24} md={8} style={{ marginTop: 16 }}>
              <div>
                <Text type="secondary">City</Text>
                <div><Text strong>{address?.city || 'N/A'}</Text></div>
              </div>
            </Col>
            <Col xs={24} md={8} style={{ marginTop: 16 }}>
              <div>
                <Text type="secondary">State</Text>
                <div><Text strong>{address?.state || 'N/A'}</Text></div>
              </div>
            </Col>
            <Col xs={24} md={8} style={{ marginTop: 16 }}>
              <div>
                <Text type="secondary">ZIP</Text>
                <div><Text strong>{address?.zip || 'N/A'}</Text></div>
              </div>
            </Col>
          </Row>
        ) : (
          <>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Street"
              name={['address', 'street']}
              rules={[{ required: true, message: 'Street is required' }]}
            >
              <Input placeholder="123 Main St" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Unit" name={['address', 'unit']}>
              <Input placeholder="Apt, Suite (optional)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label="City"
              name={['address', 'city']}
              rules={[{ required: true, message: 'City is required' }]}
            >
              <Input placeholder="City" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="State"
              name={['address', 'state']}
              rules={[{ required: true, message: 'State is required' }]}
            >
              <Input placeholder="State" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="ZIP"
              name={['address', 'zip']}
              rules={[{ required: true, message: 'ZIP is required' }]}
            >
              <Input placeholder="ZIP" />
            </Form.Item>
          </Col>
        </Row>
          </>
        )}
      </Form>
    </Card>
  );
}
