import React, { useEffect } from 'react';
import { Card, Form, Select, Input, Button, Space, Row, Col, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProfile, updateMyProfileThunk } from '../../../features/employee/employeeThunks.js';
import { selectMyProfile, selectMyProfileStatus, selectMyProfileUpdateStatus } from '../../../features/employee/employeeSelectors.js';

const CITIZENSHIP_OPTIONS = [
  { label: 'Citizen', value: 'citizen' },
  { label: 'Permanent Resident', value: 'permanent_resident' },
  { label: 'Work Visa', value: 'work_visa' },
];

const WORK_AUTH_OPTIONS = [
  { label: 'H1-B', value: 'H1-B' },
  { label: 'L2', value: 'L2' },
  { label: 'F1 (CPT/OPT)', value: 'F1(CPT/OPT)' },
  { label: 'H4', value: 'H4' },
  { label: 'Other', value: 'Other' },
];

export default function EmploymentSection() {
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
        citizenshipStatus: profile.citizenshipStatus,
        workAuthorizationType: profile.workAuthorizationType,
        visaTitle: profile.visaTitle,
        visaStartDate: profile.visaStartDate ? profile.visaStartDate.slice(0, 10) : undefined,
        visaEndDate: profile.visaEndDate ? profile.visaEndDate.slice(0, 10) : undefined,
      });
    }
  }, [profile, form]);

  const onValuesChange = (changed, all) => {
    if (changed.citizenshipStatus && changed.citizenshipStatus !== 'work_visa') {
      form.setFieldsValue({
        workAuthorizationType: undefined,
        visaTitle: undefined,
        visaStartDate: undefined,
        visaEndDate: undefined,
      });
    }
    if (changed.workAuthorizationType && changed.workAuthorizationType !== 'Other') {
      form.setFieldValue('visaTitle', undefined);
    }
  };

  const onFinish = async (values) => {
    const updateData = {
      citizenshipStatus: values.citizenshipStatus,
      workAuthorizationType: values.citizenshipStatus === 'work_visa' ? values.workAuthorizationType : undefined,
      visaTitle: values.workAuthorizationType === 'Other' ? values.visaTitle : undefined,
      visaStartDate: values.citizenshipStatus === 'work_visa' && values.visaStartDate
        ? new Date(values.visaStartDate).toISOString()
        : undefined,
      visaEndDate: values.citizenshipStatus === 'work_visa' && values.visaEndDate
        ? new Date(values.visaEndDate).toISOString()
        : undefined,
    };
    const res = await dispatch(updateMyProfileThunk(updateData));
    if (res.error) {
      message.error(res.error.message || 'Failed to save');
    } else {
      message.success('Saved');
      dispatch(fetchMyProfile());
    }
  };

  const isWorkVisa = Form.useWatch('citizenshipStatus', form) === 'work_visa';
  const workAuth = Form.useWatch('workAuthorizationType', form);

  return (
    <Card title="Work Authorization" loading={loading} bordered={false}>
      <Form form={form} layout="vertical" onValuesChange={onValuesChange} onFinish={onFinish}>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Citizenship Status"
              name="citizenshipStatus"
              rules={[{ required: true, message: 'Citizenship status is required' }]}
            >
              <Select options={CITIZENSHIP_OPTIONS} placeholder="Select status" />
            </Form.Item>
          </Col>

          {isWorkVisa && (
            <Col xs={24} md={8}>
              <Form.Item
                label="Work Authorization Type"
                name="workAuthorizationType"
                rules={[{ required: true, message: 'Work authorization is required' }]}
              >
                <Select options={WORK_AUTH_OPTIONS} placeholder="Select type" />
              </Form.Item>
            </Col>
          )}

          {isWorkVisa && workAuth === 'Other' && (
            <Col xs={24} md={8}>
              <Form.Item
                label="Visa Title"
                name="visaTitle"
                rules={[{ required: true, message: 'Visa title is required' }]}
              >
                <Input placeholder="Enter visa title" />
              </Form.Item>
            </Col>
          )}
        </Row>

        {isWorkVisa && (
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Visa Start Date"
                name="visaStartDate"
                rules={[{ required: true, message: 'Start date is required' }]}
              >
                <input type="date" className="ant-input" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Visa End Date"
                name="visaEndDate"
                rules={[{ required: true, message: 'End date is required' }]}
              >
                <input type="date" className="ant-input" />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Space>
          <Button type="primary" htmlType="submit" loading={saving}>Save</Button>
          <Button onClick={() => form.resetFields()} disabled={saving}>Reset</Button>
        </Space>
      </Form>
    </Card>
  );
}