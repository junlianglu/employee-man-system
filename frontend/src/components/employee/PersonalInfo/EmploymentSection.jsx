import React, { useEffect, useState } from 'react';
import { Card, Form, Select, Input, Button, Space, Row, Col, message, DatePicker, Typography, Popconfirm } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProfile, updateMyProfileThunk } from '../../../features/employee/employeeThunks.js';
import { selectMyProfile, selectMyProfileStatus, selectMyProfileUpdateStatus } from '../../../features/employee/employeeSelectors.js';

const { Text } = Typography;


export default function EmploymentSection() {
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
        visaTitle: profile.visaTitle,
        visaStartDate: profile.visaStartDate ? dayjs(profile.visaStartDate) : undefined,
        visaEndDate: profile.visaEndDate ? dayjs(profile.visaEndDate) : undefined,
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
          visaTitle: profile.visaTitle,
          visaStartDate: profile.visaStartDate ? dayjs(profile.visaStartDate) : undefined,
          visaEndDate: profile.visaEndDate ? dayjs(profile.visaEndDate) : undefined,
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
      visaTitle: profile?.workAuthorizationType === 'Other' ? values.visaTitle : undefined,
      visaStartDate: isProfileWorkVisa && values.visaStartDate
        ? values.visaStartDate.format('YYYY-MM-DD')
        : undefined,
      visaEndDate: isProfileWorkVisa && values.visaEndDate
        ? values.visaEndDate.format('YYYY-MM-DD')
        : undefined,
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

  const workAuth = profile?.workAuthorizationType;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return dayjs(date).format('MM/DD/YYYY');
  };

  if (loading) {
    return <Card title="Work Authorization" loading bordered={false} />;
  }

  const isProfileWorkVisa = profile?.citizenshipStatus === 'work_visa';

  return (
    <Card
      title="Employment"
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
            {isProfileWorkVisa ? (
              <>
                {profile?.workAuthorizationType === 'Other' && (
        <Row gutter={16}>
          <Col xs={24} md={8}>
                      <div>
                        <Text type="secondary">Visa Title</Text>
                        <div><Text strong>{profile?.visaTitle || 'N/A'}</Text></div>
                      </div>
                    </Col>
                  </Row>
                )}
                <Row gutter={16} style={{ marginTop: profile?.workAuthorizationType === 'Other' ? 16 : 0 }}>
                  <Col xs={24} md={8}>
                    <div>
                      <Text type="secondary">Visa Start Date</Text>
                      <div><Text strong>{formatDate(profile?.visaStartDate)}</Text></div>
                    </div>
          </Col>
            <Col xs={24} md={8}>
                    <div>
                      <Text type="secondary">Visa End Date</Text>
                      <div><Text strong>{formatDate(profile?.visaEndDate)}</Text></div>
                    </div>
                  </Col>
                </Row>
              </>
            ) : (
              <Row gutter={16}>
                <Col xs={24}>
                  <Text type="secondary">No visa information available</Text>
            </Col>
              </Row>
          )}
          </>
        ) : (
          <>
            {isProfileWorkVisa ? (
              <>
                {workAuth === 'Other' && (
                  <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Visa Title"
                name="visaTitle"
                rules={[{ required: true, message: 'Visa title is required' }]}
              >
                <Input placeholder="Enter visa title" />
              </Form.Item>
            </Col>
                  </Row>
          )}

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Visa Start Date"
                name="visaStartDate"
                rules={[{ required: true, message: 'Start date is required' }]}
              >
                      <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Visa End Date"
                name="visaEndDate"
                rules={[{ required: true, message: 'End date is required' }]}
              >
                      <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
              </>
            ) : (
              <Row gutter={16}>
                <Col xs={24}>
                  <Text type="secondary">No visa information available</Text>
                </Col>
              </Row>
            )}
          </>
        )}
      </Form>
    </Card>
  );
}
