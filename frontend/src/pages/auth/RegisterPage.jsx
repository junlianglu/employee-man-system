import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Spin, Result, Card, Typography, message, Form, Input, Button } from 'antd';
import {
  validateRegistrationTokenThunk,
  submitRegistrationThunk,
} from '../../features/registrationToken/registrationTokenThunks.js';
import {
  selectRegistrationValidationStatus,
  selectRegistrationValidationData,
  selectRegistrationValidationError,
  selectRegistrationSubmitStatus,
  selectRegistrationSubmitError,
} from '../../features/registrationToken/registrationTokenSelectors.js';

export default function RegisterPage() {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validationStatus = useSelector(selectRegistrationValidationStatus);
  const tokenInfo = useSelector(selectRegistrationValidationData);
  const validationError = useSelector(selectRegistrationValidationError);

  const submitStatus = useSelector(selectRegistrationSubmitStatus);
  const submitError = useSelector(selectRegistrationSubmitError);

  useEffect(() => {
    if (token) dispatch(validateRegistrationTokenThunk({ token }));
  }, [dispatch, token]);

  const [form] = Form.useForm();

  if (validationStatus === 'loading') {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (validationStatus === 'failed') {
    return (
      <Result
        status="error"
        title="Invalid or expired registration link"
        subTitle={validationError || 'Please contact HR for a new invitation.'}
        extra={null}
      />
    );
  }

  return (
    <Row justify="center" style={{ padding: 16 }}>
      <Col xs={24} md={20} lg={14}>
        <Card>
          <Typography.Title level={3} style={{ marginTop: 0 }}>
            Complete Your Registration
          </Typography.Title>
          {tokenInfo ? (
            <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
              Registering: {tokenInfo.firstName} {tokenInfo.middleName ? `${tokenInfo.middleName} ` : ''}{tokenInfo.lastName} ({tokenInfo.email})
            </Typography.Paragraph>
          ) : null}

          <Form
            layout="vertical"
            form={form}
            onFinish={async (values) => {
              try {
                await dispatch(submitRegistrationThunk({ token, employeeData: values })).unwrap();
                message.success('Registration complete. You can now sign in.');
                navigate('/auth/login', { replace: true });
              } catch (e) {
                console.error(e);
              }
            }}
            initialValues={{ username: '' }}
          >
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: 'Username is required' }, { min: 3 }, { max: 32 }]}
            >
              <Input placeholder="Choose a username" autoComplete="username" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Password is required' }, { min: 6 }]}
              hasFeedback
            >
              <Input.Password autoComplete="new-password" placeholder="Enter a strong password" />
            </Form.Item>
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
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitStatus === 'loading'} block>
                Create Account
              </Button>
            </Form.Item>
          </Form>

          {submitStatus === 'failed' && submitError ? (
            <Typography.Paragraph type="danger" style={{ marginTop: 16 }}>
              {submitError}
            </Typography.Paragraph>
          ) : null}
        </Card>
      </Col>
    </Row>
  );
}