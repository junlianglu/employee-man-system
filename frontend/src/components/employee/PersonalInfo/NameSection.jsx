import React, { useEffect } from 'react';
import { Card, Form, Input, Select, Button, Space, message, Row, Col, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProfile, updateMyProfileThunk } from '../../../features/employee/employeeThunks.js';
import { selectMyProfile, selectMyProfileStatus, selectMyProfileUpdateStatus } from '../../../features/employee/employeeSelectors.js';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'I do not wish to answer', value: 'I do not wish to answer' },
];

export default function NameSection() {
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
        firstName: profile.firstName,
        middleName: profile.middleName,
        lastName: profile.lastName,
        preferredName: profile.preferredName,
        gender: profile.gender,
        ssn: profile.ssn,
        dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : undefined,  
      });
    }
  }, [profile, form]);

  const onFinish = async (values) => {
    const updateData = {
      firstName: values.firstName,
      middleName: values.middleName,
      lastName: values.lastName,
      preferredName: values.preferredName,
      gender: values.gender,
      ssn: values.ssn,
      dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : undefined,
    };
    const res = await dispatch(updateMyProfileThunk(updateData));
    if (res.error) {
      message.error(res.error.message || 'Failed to save');
    } else {
      message.success('Saved');
    }
  };

  return (
    <Card title="Name & Basic Info" loading={loading} bordered={false}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: 'First name is required' }]}
            >
              <Input placeholder="First name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Middle Name" name="middleName">
              <Input placeholder="Middle name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: 'Last name is required' }]}
            >
              <Input placeholder="Last name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="Preferred Name" name="preferredName">
              <Input placeholder="Preferred name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Gender"
              name="gender"
              rules={[{ required: true, message: 'Gender is required' }]}
            >
              <Select options={GENDER_OPTIONS} placeholder="Select gender" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Date of Birth"
              name="dateOfBirth"
              rules={[{ required: true, message: 'Date of birth is required' }]}
              tooltip="Must be in the past"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label="SSN"
              name="ssn"
              rules={[{ required: true, message: 'SSN is required' }]}
              tooltip="We store it securely"
            >
              <Input placeholder="XXX-XX-XXXX" />
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