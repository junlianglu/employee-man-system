import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Button, Alert, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../features/auth/authThunks.js';
import { selectLoginStatus, selectAuthError, selectCurrentUser } from '../../../features/auth/authSelectors.js';

export default function AuthForm({ title = 'Sign In', onSuccess, redirectTo }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const status = useSelector(selectLoginStatus);
  const error = useSelector(selectAuthError);
  const [formError, setFormError] = useState(null);

  const handleFinish = useCallback(async (values) => {
    setFormError(null);
    try {
      const res = await dispatch(login(values)).unwrap();
      const isHR = !!res?.user?.isHR;
      if (onSuccess) onSuccess(res);
      else {
        if (redirectTo) navigate(redirectTo, { replace: true });
        else navigate(isHR ? '/hr' : '/employee', { replace: true });
      }
    } catch (e) {
      setFormError(e?.message || 'Login failed');
    }
  }, [dispatch, navigate, onSuccess, redirectTo]);

  return (
    <Card style={{ maxWidth: 420, margin: '0 auto' }}>
      <Typography.Title level={3} style={{ textAlign: 'center', marginTop: 0 }}>
        {title}
      </Typography.Title>

      {(formError || error) && (
        <Alert type="error" showIcon style={{ marginBottom: 16 }} message={formError || error} />
      )}

      <Form layout="vertical" onFinish={handleFinish} initialValues={{ username: '', password: '' }}>
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: 'Please enter your username' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Username" autoComplete="username" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<LoginOutlined />}
            loading={status === 'loading'}
            block
          >
            Sign In
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}