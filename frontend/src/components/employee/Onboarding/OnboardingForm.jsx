import { useMemo } from 'react';
import { Form, Input, Row, Col, DatePicker, Radio, Divider, Button, Typography } from 'antd';
import dayjs from 'dayjs';
import AddressForm from '../../common/Forms/AddressForm.jsx';
import ContactForm from '../../common/Forms/ContactForm.jsx';
import EmergencyContactForm from '../../common/Forms/EmergencyContactForm.jsx';
import ReferenceForm from './ReferenceForm.jsx';
import WorkAuthorizationForm from './WorkAuthorizationForm.jsx';

export default function OnboardingForm({ initialValues, submitting = false, onSubmit, readOnly = false, showAccount = true, showEmail = true, onValuesChange }) {
  const [form] = Form.useForm();

  const normalizedInitialValues = useMemo(() => {
    if (!initialValues) return undefined;
    const clone = { ...initialValues };
    if (clone.visaStartDate) clone.visaStartDate = dayjs(clone.visaStartDate);
    if (clone.visaEndDate) clone.visaEndDate = dayjs(clone.visaEndDate);
    if (clone.dateOfBirth) clone.dateOfBirth = dayjs(clone.dateOfBirth);
    return clone;
  }, [initialValues]);

  const handleFinish = (values) => {
    const payload = { ...values };
    if (payload.email) delete payload.email; // do not allow changing email here
    if (payload.dateOfBirth) payload.dateOfBirth = values.dateOfBirth?.format('YYYY-MM-DD');
    if (values.visaStartDate) payload.visaStartDate = values.visaStartDate?.format('YYYY-MM-DD');
    if (values.visaEndDate) payload.visaEndDate = values.visaEndDate?.format('YYYY-MM-DD');
    if (payload.citizenshipStatus !== 'work_visa') {
      delete payload.workAuthorizationType;
      delete payload.visaTitle;
      delete payload.visaStartDate;
      delete payload.visaEndDate;
    }
    if (payload.confirmPassword) delete payload.confirmPassword;
    if (!showAccount) {
      delete payload.username;
      delete payload.password;
    }
    onSubmit?.(payload);
  };

  return (
    <Form
      layout="vertical"
      form={form}
      initialValues={normalizedInitialValues}
      onFinish={handleFinish}
      disabled={readOnly}
      onValuesChange={(_, allValues) => onValuesChange?.(allValues)}
    >
      {showAccount && (
        <>
          <Typography.Title level={4} style={{ marginTop: 0 }}>Account</Typography.Title>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: 'Username is required' }, { min: 3 }, { max: 32 }]}
              >
                <Input placeholder="Choose a username" autoComplete="username" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="preferredName"
                label="Preferred Name"
                rules={[{ max: 60 }]}
              >
                <Input placeholder="Optional" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: 'Password is required' }, { min: 6 }]}
                hasFeedback
              >
                <Input.Password autoComplete="new-password" placeholder="Enter a strong password" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve();
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password autoComplete="new-password" placeholder="Re-enter password" />
              </Form.Item>
            </Col>
          </Row>
          <Divider />
        </>
      )}

      <Typography.Title level={4}>Personal Information</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'First name is required' }, { max: 60 }]}
          >
            <Input placeholder="First name" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="middleName"
            label="Middle Name"
            rules={[{ max: 60 }]}
          >
            <Input placeholder="Optional" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Last name is required' }, { max: 60 }]}
          >
            <Input placeholder="Last name" />
          </Form.Item>
        </Col>
      </Row>
      {showEmail && (
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Invalid email' }]}>
              <Input disabled placeholder="Email" />
            </Form.Item>
          </Col>
        </Row>
      )}
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="ssn"
            label="SSN"
            rules={[{ required: true, message: 'SSN is required' }, { pattern: /^(\d{3}-?\d{2}-?\d{4})$/, message: 'Invalid SSN' }]}
          >
            <Input placeholder="123-45-6789" maxLength={11} />
          </Form.Item>
        </Col>
        {!showAccount && (
          <Col xs={24} md={12}>
            <Form.Item
              name="preferredName"
              label="Preferred Name"
              rules={[{ max: 60 }]}
            >
              <Input placeholder="Optional" />
            </Form.Item>
          </Col>
        )}
        <Col xs={24} md={12}>
          <Form.Item
            name="dateOfBirth"
            label="Date of Birth"
            rules={[{ required: true, message: 'Date of birth is required' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="gender" label="Gender" rules={[{ required: true, message: 'Please select' }] }>
            <Radio.Group>
              <Radio value="male">Male</Radio>
              <Radio value="female">Female</Radio>
              <Radio value="I do not wish to answer">I do not wish to answer</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <AddressForm />

      <Divider />

      <Typography.Title level={4}>Contact</Typography.Title>
      <ContactForm includeWorkPhone={true} />

      <Divider />

      <Typography.Title level={4}>Work Authorization</Typography.Title>
      <WorkAuthorizationForm />

      <Divider />

      <Typography.Title level={4}>Reference</Typography.Title>
      <ReferenceForm />

      <Divider />

      <Typography.Title level={4}>Emergency Contacts</Typography.Title>
      <EmergencyContactForm />

      <Divider />

      {!readOnly && (
        <Row justify="end" gutter={8}>
          <Col>
            <Button onClick={() => form.resetFields()} disabled={submitting}>Reset</Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Submit
            </Button>
          </Col>
        </Row>
      )}
    </Form>
  );
}

