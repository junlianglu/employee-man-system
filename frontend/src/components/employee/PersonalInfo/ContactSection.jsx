import React, { useEffect } from 'react';
import { Card, Form, Input, Button, Space, Row, Col, Typography, message } from 'antd';
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

  useEffect(() => {
    if (!profile) dispatch(fetchMyProfile());
  }, [dispatch, profile]);

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        cellPhone: profile.cellPhone,
        workPhone: profile.workPhone,
        email: profile.email,
      });
    }
  }, [profile, form]);

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
    }
  };

  return (
    <Card title="Contact" loading={loading} bordered={false}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
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

        <Space>
          <Button type="primary" htmlType="submit" loading={saving}>Save</Button>
          <Button onClick={() => form.resetFields()} disabled={saving}>Reset</Button>
        </Space>
      </Form>
    </Card>
  );
}