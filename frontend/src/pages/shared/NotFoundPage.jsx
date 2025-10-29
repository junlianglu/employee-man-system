import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="The page you visited does not exist."
      extra={
        <>
          <Button type="primary" onClick={() => navigate('/')}>
            Go Home
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </>
      }
    />
  );
}