import React, { useEffect } from 'react';
import { Card, Form, Input, Button, Space, Row, Col, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProfile, updateMyProfileThunk } from '../../../features/employee/employeeThunks.js';
import { selectMyProfile, selectMyProfileStatus, selectMyProfileUpdateStatus } from '../../../features/employee/employeeSelectors.js';

export default function AddressSection() {
  const dispatch = useDispatch();
  const profile = useSelector(selectMyProfile);
  const loading = useSelector(selectMyProfileStatus) === 'loading';
  const saving = useSelector(selectMyProfileUpdateStatus) === 'loading';

  const [form] = Form.useForm();

  useEffect(() => {
    if (!profile) dispatch(fetchMyProfile());
  }, [dispatch, profile]);

  useEffect(() => {
    if (profile?.address) {
      form.setFieldsValue({
        address: {
          street: profile.address.street,
          unit: profile.address.unit,
          city: profile.address.city,
          state: profile.address.state,
          zip: profile.address.zip,
        },
      });
    }
  }, [profile, form]);

  const onFinish = async (values) => {
    const updateData = { address: values.address };
    const res = await dispatch(updateMyProfileThunk(updateData));
    if (res.error) {
      message.error(res.error.message || 'Failed to save');
    } else {
      message.success('Saved');
      dispatch(fetchMyProfile());
    }
  };

  return (
    <Card title="Address" loading={loading} bordered={false}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
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

        <Space>
          <Button type="primary" htmlType="submit" loading={saving}>Save</Button>
          <Button onClick={() => form.resetFields()} disabled={saving}>Reset</Button>
        </Space>
      </Form>
    </Card>
  );
}