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
    // Give it a timeout - if we're stuck loading, allow access (fail open)
    if (onboardingStatus === 'loading' && !onboardingData) {
      return (
        <div style={{ display: 'grid', placeItems: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      );
    }

    // If we have data (regardless of status), use it for access control
    if (onboardingData) {
      const status = onboardingData.status;
      const isOnboardingPage = location.pathname === '/employee/onboarding';
      
      // If onboarding is not approved (never_submitted, pending, rejected)
      // and user is trying to access a different page, redirect to onboarding
      if ((status === 'never_submitted' || status === 'pending' || status === 'rejected') && !isOnboardingPage) {
        return <Navigate to="/employee/onboarding" replace />;
      }
      
      // Otherwise allow access
      return <Outlet />;
    }

    // If fetch failed or status is idle (not yet fetched), allow access (fail open)
    // The login page will handle fetching and redirect
    if (onboardingStatus === 'failed' || onboardingStatus === 'idle') {
      return <Outlet />;
    }

    // Default: allow access if we're unsure
    return <Outlet />;
  }

  return <Outlet />;
}
