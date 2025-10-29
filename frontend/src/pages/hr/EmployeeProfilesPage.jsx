import React, { useEffect, useMemo, useState } from 'react';
import { Typography, Space, Card } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { fetchEmployees } from '../../features/employee/employeeThunks.js';
import {
  selectEmployees,
  selectEmployeesStatus,
  selectEmployeesPagination,
} from '../../features/employee/employeeSelectors.js';

import EmployeeSearch from '../../components/hr/EmployeeList/EmployeeSearch.jsx';
import EmployeeSummary from '../../components/hr/EmployeeList/EmployeeSummary.jsx';

const { Title, Paragraph } = Typography;

export default function EmployeeProfilesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const employees = useSelector(selectEmployees);
  const employeesStatus = useSelector(selectEmployeesStatus);
  const pagination = useSelector(selectEmployeesPagination);

  const [query, setQuery] = useState({
    page: 1,
    limit: 12,
    search: undefined,
    status: undefined,
    visa: undefined, 
  });

  useEffect(() => {
    const { page, limit, search, status } = query;
    dispatch(fetchEmployees({ page, limit, search, status }));
  }, [dispatch, query.page, query.limit, query.search, query.status]);

  const filteredItems = useMemo(() => {
    if (!query.visa) return employees;
    return (employees || []).filter((e) => e.citizenshipStatus === query.visa);
  }, [employees, query.visa]);

  const loading = employeesStatus === 'loading';

  const handleSearch = (values) => {
    setQuery((q) => ({
      ...q,
      page: 1,
      search: values.search,
      status: values.status,
      visa: values.visa,
    }));
  };

  const handleChangePage = (page) => {
    setQuery((q) => ({ ...q, page }));
  };

  const onViewProfile = (employeeId) => navigate(`/hr/employees/${employeeId}`);
  const onViewDocuments = (employeeId) => navigate(`/hr/visa-status`);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography>
        <Title level={3} style={{ margin: 0 }}>Employees</Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Search, filter, and browse employee profiles.
        </Paragraph>
      </Typography>

      <Card bordered={false}>
        <EmployeeSearch
          initial={{ search: query.search, status: query.status, visa: query.visa }}
          onSearch={handleSearch}
        />
        <EmployeeSummary
          items={filteredItems}
          loading={loading}
          pagination={query.visa ? null : pagination}
          onChangePage={handleChangePage}
          onViewProfile={onViewProfile}
          onViewDocuments={onViewDocuments}
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 4 }}
        />
      </Card>
    </Space>
  );
}