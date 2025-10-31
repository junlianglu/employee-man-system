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

  // For employees: check onboarding status and restrict access if not approved
  if (!requireHR && !isHR) {
    // Show loading only if we're actively fetching and don't have data yet
    if (onboardingStatus === 'loading' && !onboardingData) {
      return (
        <div style={{ display: 'grid', placeItems: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      );
    }

    // Only redirect if we have valid onboarding data with a non-approved status
    // This prevents redirecting when data is temporarily unavailable
    if (onboardingData && onboardingData.status) {
      const status = onboardingData.status;
      const isOnboardingPage = location.pathname === '/employee/onboarding';
      
      // Only redirect if status is explicitly not approved and we're not on onboarding page
      // Don't redirect if status is 'approved' or undefined
      if ((status === 'never_submitted' || status === 'pending' || status === 'rejected') && !isOnboardingPage) {
        return <Navigate to="/employee/onboarding" replace />;
      }
    }

    // For all other cases (failed, idle, approved, or no data), allow access
    // This prevents blank pages when onboarding data is temporarily unavailable
    return <Outlet />;
  }

  return <Outlet />;
}
