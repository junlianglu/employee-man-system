import React, { useEffect, useMemo } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Space, Button, Tag } from 'antd';
import { TeamOutlined, AuditOutlined, SolutionOutlined, FileDoneOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  fetchEmployees,
  fetchVisaStatusEmployees,
  fetchOptInProgressEmployees,
  fetchOnboardingApplications,
} from '../../features/employee/employeeThunks.js';

import {
  selectEmployees,
  selectEmployeesStatus,
  selectEmployeesPagination,
  selectVisaStatusEmployees,
  selectVisaStatusStatus,
  selectVisaStatusPagination,
  selectOptInProgressEmployees,
  selectOptInProgressStatus,
  selectOptInProgressPagination,
  selectOnboardingApplications,
  selectOnboardingApplicationsStatus,
} from '../../features/employee/employeeSelectors.js';

import StatusBadge from '../../components/common/Status/StatusBadge.jsx';

const { Title, Text } = Typography;

function nameOf(e) {
  const full = [e.firstName, e.middleName, e.lastName].filter(Boolean).join(' ');
  return full || e.preferredName || e.email || 'Employee';
}

export default function HRDashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const employees = useSelector(selectEmployees);
  const employeesStatus = useSelector(selectEmployeesStatus);
  const employeesPage = useSelector(selectEmployeesPagination);

  const visaEmployees = useSelector(selectVisaStatusEmployees);
  const visaStatus = useSelector(selectVisaStatusStatus);
  const visaPage = useSelector(selectVisaStatusPagination);

  const optEmployees = useSelector(selectOptInProgressEmployees);
  const optStatus = useSelector(selectOptInProgressStatus);
  const optPage = useSelector(selectOptInProgressPagination);


  const pendingApps = useSelector(selectOnboardingApplications);
  const pendingAppsStatus = useSelector(selectOnboardingApplicationsStatus);

  useEffect(() => {
    dispatch(fetchEmployees({ page: 1, limit: 5 }));
    dispatch(fetchVisaStatusEmployees({ page: 1, limit: 5 }));
    dispatch(fetchOptInProgressEmployees({ page: 1, limit: 5 }));
    dispatch(fetchOnboardingApplications({ status: 'pending' }));
  }, [dispatch]);

  const pendingAppsTop = useMemo(() => (pendingApps || []).slice(0, 5), [pendingApps]);

  const totalEmployees = employeesPage?.total ?? employees.length;
  const totalWorkVisa = visaPage?.total ?? visaEmployees.length;
  const totalOptInProgress = optPage?.total ?? optEmployees.length;
  const totalPendingApps = pendingApps?.length ?? 0;

  const visaSoon = useMemo(() => (visaEmployees || []).slice(0, 5), [visaEmployees]);

  const columnsRecent = [
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (_, r) => nameOf(r),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (v) => <Text type="secondary">{v}</Text>,
    },
    {
      title: 'Onboarding',
      dataIndex: ['onboardingReview', 'status'],
      key: 'onboarding',
      render: (_, r) => <StatusBadge status={r.onboardingReview?.status || 'never_submitted'} />,
    },
  ];

  const columnsVisaSoon = [
    {
      title: 'Name',
      key: 'name',
      render: (_, r) => nameOf(r),
    },
    {
      title: 'Type',
      dataIndex: 'workAuthorizationType',
      key: 'type',
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: 'Visa End',
      dataIndex: 'visaEndDate',
      key: 'visaEndDate',
      render: (v) => (v ? new Date(v).toLocaleDateString() : '-'),
    },
    {
      title: 'Days Remaining',
      dataIndex: 'daysRemaining',
      key: 'daysRemaining',
      render: (v) => (v ?? '-') ,
    },
  ];

  const columnsOpt = [
    {
      title: 'Name',
      key: 'name',
      render: (_, r) => nameOf(r),
    },
    {
      title: 'Next Step',
      dataIndex: 'nextStep',
      key: 'nextStep',
      render: (v) => <Text>{v}</Text>,
    },
    {
      title: 'Days Remaining',
      dataIndex: 'daysRemaining',
      key: 'daysRemaining',
      render: (v) => (v ?? '-') ,
    },
  ];

  const columnsPendingApps = [
    {
      title: 'Applicant',
      key: 'name',
      render: (_, r) => nameOf(r),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (v) => <Text type="secondary">{v}</Text>,
    },
    {
      title: 'Status',
      dataIndex: ['onboardingReview', 'status'],
      key: 'status',
      render: (v) => <StatusBadge status={v || 'pending'} />,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={3} style={{ margin: 0 }}>HR Dashboard</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Employees"
              value={totalEmployees}
              prefix={<TeamOutlined />}
            />
            <Space style={{ marginTop: 12 }}>
              <Button size="small" onClick={() => navigate('/hr/employees')}>Manage</Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Work Visa Employees"
              value={totalWorkVisa}
              prefix={<AuditOutlined />}
            />
            <Space style={{ marginTop: 12 }}>
              <Button size="small" onClick={() => navigate('/hr/visa-status')}>View</Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card bordered={false}>
            <Statistic
              title="OPT In-Progress"
              value={totalOptInProgress}
              prefix={<SolutionOutlined />}
            />
            <Space style={{ marginTop: 12 }}>
              <Button size="small" onClick={() => navigate('/hr/visa-status')}>Review</Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Pending Onboarding"
              value={totalPendingApps}
              prefix={<FileDoneOutlined />}
            />
            <Space style={{ marginTop: 12 }}>
              <Button size="small" onClick={() => navigate('/hr/hiring')}>Process</Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            title="Recent Employees"
            extra={<Button size="small" onClick={() => navigate('/hr/employees')}>All Employees</Button>}
            loading={employeesStatus === 'loading'}
          >
            <Table
              rowKey={(r) => r._id}
              columns={columnsRecent}
              dataSource={employees}
              size="small"
              pagination={false}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            title="Visa Expiring Soon"
            extra={<Button size="small" onClick={() => navigate('/hr/visa-status')}>Visa Management</Button>}
            loading={visaStatus === 'loading'}
          >
            <Table
              rowKey={(r) => r._id}
              columns={columnsVisaSoon}
              dataSource={visaSoon}
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            title="OPT In-Progress"
            extra={<Button size="small" onClick={() => navigate('/hr/visa-status')}>View All</Button>}
            loading={optStatus === 'loading'}
          >
            <Table
              rowKey={(r) => r._id}
              columns={columnsOpt}
              dataSource={optEmployees.slice(0, 5)}
              size="small"
              pagination={false}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            title="Pending Onboarding Applications"
            extra={<Button size="small" onClick={() => navigate('/hr/hiring')}>Review All</Button>}
            loading={pendingAppsStatus === 'loading'}
          >
            <Table
              rowKey={(r) => r._id}
              columns={columnsPendingApps}
              dataSource={pendingAppsTop}
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}