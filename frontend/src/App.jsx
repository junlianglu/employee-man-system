import { Layout } from 'antd';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/common/Navigation/Navbar.jsx';

import ProtectedRoute from './components/common/Auth/ProtectedRoute.jsx';

import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';

import DashboardPage from './pages/employee/DashboardPage.jsx';
import PersonalInfoPage from './pages/employee/PersonalInfoPage.jsx';
import VisaStatusPage from './pages/employee/VisaStatusPage.jsx';
import OnboardingPage from './pages/employee/OnboardingPage.jsx';

import HRDashboardPage from './pages/hr/HRDashboardPage.jsx';
import HiringManagementPage from './pages/hr/HiringManagementPage.jsx';
import EmployeeProfilesPage from './pages/hr/EmployeeProfilesPage.jsx';
import VisaStatusManagementPage from './pages/hr/VisaStatusManagementPage.jsx';

import UnauthorizedPage from './pages/shared/UnauthorizedPage.jsx';
import NotFoundPage from './pages/shared/NotFoundPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Navbar />
        <Layout.Content style={{ padding: 16 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/auth/login" replace />} />

            {/* Public */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/register/:token" element={<RegisterPage />} />

            {/* Employee-protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/employee" element={<DashboardPage />} />
              <Route path="/employee/personal-info" element={<PersonalInfoPage />} />
              <Route path="/employee/visa-status" element={<VisaStatusPage />} />
              <Route path="/employee/onboarding" element={<OnboardingPage />} />
            </Route>

            {/* HR-protected */}
            <Route element={<ProtectedRoute requireHR={true} />}>
              <Route path="/hr" element={<HRDashboardPage />} />
              <Route path="/hr/hiring" element={<HiringManagementPage />} />
              <Route path="/hr/employees" element={<EmployeeProfilesPage />} />
              <Route path="/hr/visa" element={<VisaStatusManagementPage />} />
            </Route>

            {/* Shared */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout.Content>
      </Layout>
    </BrowserRouter>
  );
}

export default App;