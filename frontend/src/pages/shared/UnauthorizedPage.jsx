import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="403"
      subTitle="You are not authorized to access this page."
      extra={
        <>
          <Button type="primary" onClick={() => navigate('/auth/login')}>
            Go to Login
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </>
      }
    />
  );
}