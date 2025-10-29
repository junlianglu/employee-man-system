import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Spin, Result, Card, Typography, message } from 'antd';
import OnboardingForm from '../../components/employee/Onboarding/OnboardingForm.jsx';
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

  const initialValues = useMemo(() => {
    // Email/name come from token; form doesn't include email (backend binds it)
    return {
      citizenshipStatus: 'citizen',
      emergencyContacts: [{}],
      reference: {},
    };
  }, []);

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

          <OnboardingForm
            initialValues={initialValues}
            submitting={submitStatus === 'loading'}
            onSubmit={async (values) => {
              try {
                await dispatch(submitRegistrationThunk({ token, employeeData: values })).unwrap();
                message.success('Registration complete. You can now sign in.');
                navigate('/auth/login', { replace: true });
              } catch (e) {

              }
            }}
          />

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