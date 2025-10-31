import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Select, Button, Space, message, Row, Col, DatePicker, Typography, Popconfirm, Avatar } from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProfile, updateMyProfileThunk } from '../../../features/employee/employeeThunks.js';
import { selectMyProfile, selectMyProfileStatus, selectMyProfileUpdateStatus } from '../../../features/employee/employeeSelectors.js';
import { fetchMyDocuments, uploadMyDocument } from '../../../features/document/documentThunks.js';
import { selectMyDocuments, selectMyUploadStatus } from '../../../features/document/documentSelectors.js';
import DocumentModal from '../../common/Modals/DocumentModal.jsx';
import { BASE_URL } from '../../../api/base.js';

const { Text } = Typography;
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
  const documents = useSelector(selectMyDocuments);
  const uploadStatus = useSelector(selectMyUploadStatus);

  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [initialValues, setInitialValues] = useState(null);
  const [profilePicModal, setProfilePicModal] = useState({ open: false });

  useEffect(() => {
    if (!profile) dispatch(fetchMyProfile());
    dispatch(fetchMyDocuments());
  }, [dispatch, profile]);

  useEffect(() => {
    if (profile && !isEditing) {
      const values = {
        firstName: profile.firstName,
        middleName: profile.middleName,
        lastName: profile.lastName,
        preferredName: profile.preferredName,
        gender: profile.gender,
        ssn: profile.ssn,
        dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : undefined,
        email: profile.email,
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
            firstName: profile.firstName,
            middleName: profile.middleName,
            lastName: profile.lastName,
            preferredName: profile.preferredName,
            gender: profile.gender,
            ssn: profile.ssn,
            dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : undefined,
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
      setIsEditing(false);
      setInitialValues(form.getFieldsValue());
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return dayjs(date).format('MM/DD/YYYY');
  };

  const getGenderLabel = (value) => {
    const option = GENDER_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : value || 'N/A';
  };

  const profilePictureDoc = documents?.find(d => d.type === 'profile_picture');

  // Get the full URL for the profile picture
  // Uses the static file path since backend serves /uploads as static files
  const getProfilePictureUrl = () => {
    if (!profilePictureDoc?._id || !profilePictureDoc?.fileUrl) return undefined;
    
    // If fileUrl is already a full URL, return it; otherwise prepend BASE_URL
    if (profilePictureDoc.fileUrl.startsWith('http')) {
      return profilePictureDoc.fileUrl;
    }
    // fileUrl is typically like "/uploads/filename.jpg"
    return `${BASE_URL}${profilePictureDoc.fileUrl.startsWith('/') ? '' : '/'}${profilePictureDoc.fileUrl}`;
  };

  // Generate initials for default avatar
  const getInitials = () => {
    if (!profile) return 'U';
    const first = profile.firstName?.[0]?.toUpperCase() || '';
    const last = profile.lastName?.[0]?.toUpperCase() || '';
    return first + last || 'U';
  };


  const handleUploadProfilePicture = async ({ type, file }) => {
    try {
      await dispatch(uploadMyDocument({ type, file })).unwrap();
      message.success('Profile picture uploaded');
      setProfilePicModal({ open: false });
      dispatch(fetchMyDocuments()); // Refresh documents
    } catch (e) {
      message.error(e?.message || 'Failed to upload');
    }
  };

  if (loading) {
    return <Card title="Name & Basic Info" loading bordered={false} />;
  }

  return (
    <Card
      title="Name & Basic Info"
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
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <div>
                  <Text type="secondary">First Name</Text>
                  <div><Text strong>{profile?.firstName || 'N/A'}</Text></div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div>
                  <Text type="secondary">Middle Name</Text>
                  <div><Text strong>{profile?.middleName || 'N/A'}</Text></div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div>
                  <Text type="secondary">Last Name</Text>
                  <div><Text strong>{profile?.lastName || 'N/A'}</Text></div>
                </div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col xs={24} md={8}>
                <div>
                  <Text type="secondary">Preferred Name</Text>
                  <div><Text strong>{profile?.preferredName || 'N/A'}</Text></div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div>
                  <Text type="secondary">Gender</Text>
                  <div><Text strong>{getGenderLabel(profile?.gender)}</Text></div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div>
                  <Text type="secondary">Date of Birth</Text>
                  <div><Text strong>{formatDate(profile?.dateOfBirth)}</Text></div>
                </div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col xs={24} md={8}>
                <div>
                  <Text type="secondary">SSN</Text>
                  <div><Text strong>{profile?.ssn || 'N/A'}</Text></div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div>
                  <Text type="secondary">Email</Text>
                  <div><Text strong>{profile?.email || 'N/A'}</Text></div>
                </div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col xs={24} md={8}>
                <div>
                  <Text type="secondary">Profile Picture</Text>
                  <div style={{ marginTop: 8 }}>
                    <Avatar
                      size={120}
                      src={getProfilePictureUrl()}
                      icon={<UserOutlined />}
                      style={{ 
                        border: '2px solid #d9d9d9',
                        display: 'block'
                      }}
                      onError={() => false}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </>
        ) : (
          <>
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
              <Col xs={24} md={8}>
                <Form.Item
                  label="Email"
                  name="email"
                >
                  <Input placeholder="Email" disabled />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item label="Profile Picture">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Avatar
                      size={120}
                      src={getProfilePictureUrl()}
                      icon={<UserOutlined />}
                      style={{ 
                        border: '2px solid #d9d9d9',
                        display: 'block'
                      }}
                      onError={() => false}
                    />
                    <Button
                      type="dashed"
                      onClick={() => setProfilePicModal({ open: true, doc: profilePictureDoc || { type: 'profile_picture' } })}
                      block
                    >
                      {profilePictureDoc?._id ? 'Replace Profile Picture' : 'Upload Profile Picture'}
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </>
        )}
      </Form>

      <DocumentModal
        open={profilePicModal.open}
        title="Upload Profile Picture"
        defaultType="profile_picture"
        allowedTypes={['profile_picture']}
        document={profilePictureDoc || null}
        uploading={uploadStatus === 'loading'}
        onSubmit={handleUploadProfilePicture}
        onCancel={() => setProfilePicModal({ open: false })}
      />
    </Card>
  );
}
