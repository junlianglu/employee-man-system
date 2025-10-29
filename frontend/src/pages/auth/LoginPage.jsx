import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, Row, Col, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthForm from '../../components/common/Auth/AuthForm.jsx';
import { selectIsAuthenticated, selectIsHR } from '../../features/auth/authSelectors.js';

export default function LoginPage() {
  const isAuthed = useSelector(selectIsAuthenticated);
  const isHR = useSelector(selectIsHR);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthed) {
      const to = location.state?.from?.pathname || (isHR ? '/hr' : '/employee');
      navigate(to, { replace: true });
    }
  }, [isAuthed, isHR, navigate, location.state]);

  return (
    <Row justify="center" align="middle" style={{ minHeight: '80vh', padding: 16 }}>
      <Col xs={24} sm={20} md={12} lg={8}>
        <Card bordered={false} style={{ textAlign: 'center', marginBottom: 16, boxShadow: 'none' }}>
          <Typography.Title level={2} style={{ margin: 0 }}>Welcome back</Typography.Title>
          <Typography.Text type="secondary">Sign in to continue</Typography.Text>
        </Card>
        <AuthForm />
      </Col>
    </Row>
  );
}