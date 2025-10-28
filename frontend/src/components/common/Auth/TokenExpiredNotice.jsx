import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function TokenExpiredNotice({ title = 'Session expired', subTitle = 'Please sign in again to continue.', onBack }) {
  const navigate = useNavigate();
  return (
    <Result
      status="warning"
      title={title}
      subTitle={subTitle}
      extra={
        <Button type="primary" onClick={() => (onBack ? onBack() : navigate('/auth/login', { replace: true }))}>
          Go to Login
        </Button>
      }
    />
  );
}