import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { selectIsAuthenticated, selectIsHR, selectInitStatus } from '../../../features/auth/authSelectors.js';
import { selectOnboardingStatusData, selectOnboardingStatusState } from '../../../features/employee/employeeSelectors.js';

export default function ProtectedRoute({ requireHR = false, fallback = '/auth/login', unauthorized = '/unauthorized' }) {
  const isAuthed = useSelector(selectIsAuthenticated);
  const isHR = useSelector(selectIsHR);
  const initStatus = useSelector(selectInitStatus);
  const location = useLocation();
  
  const onboardingStatus = useSelector(selectOnboardingStatusState);
  const onboardingData = useSelector(selectOnboardingStatusData);

  if (initStatus === 'loading') {
    return (
      <div style={{ display: 'grid', placeItems: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthed) {
    return <Navigate to={fallback} replace state={{ from: location }} />;
  }

  if (requireHR && !isHR) {
    return <Navigate to={unauthorized} replace />;
  }

  if (!requireHR && !isHR) {
    if (onboardingStatus === 'loading' && !onboardingData) {
      return (
        <div style={{ display: 'grid', placeItems: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      );
    }

    if (onboardingData && onboardingData.status) {
      const status = onboardingData.status;
      const isOnboardingPage = location.pathname === '/employee/onboarding';
      
      if ((status === 'never_submitted' || status === 'pending' || status === 'rejected') && !isOnboardingPage) {
        return <Navigate to="/employee/onboarding" replace />;
      }
    }

    return <Outlet />;
  }

  return <Outlet />;
}
