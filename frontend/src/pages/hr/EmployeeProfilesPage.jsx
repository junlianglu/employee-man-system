import React, { useEffect, useMemo, useState } from 'react';
import { Typography, Space, Card, Alert } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
import './styles/EmployeeProfilesPage.css';

import { fetchEmployees } from '../../features/employee/employeeThunks.js';
import {
  selectEmployees,
  selectEmployeesStatus,
  selectEmployeesPagination,
} from '../../features/employee/employeeSelectors.js';

import EmployeeSearch from '../../components/hr/EmployeeList/EmployeeSearch.jsx';
import EmployeeSummaryList from '../../components/hr/EmployeeList/EmployeeSummaryList.jsx';

const { Title, Paragraph } = Typography;

export default function EmployeeProfilesPage() {
  const dispatch = useDispatch();
  // const navigate = useNavigate();

  const employees = useSelector(selectEmployees);
  const employeesStatus = useSelector(selectEmployeesStatus);
  const pagination = useSelector(selectEmployeesPagination);

  const [query, setQuery] = useState({
    page: 1,
    limit: 1000,
    search: undefined,
  });

  const [realTimeSearch, setRealTimeSearch] = useState('');

  useEffect(() => {
    const { page, limit, status } = query;
    const search = realTimeSearch || query.search;
    dispatch(fetchEmployees({ page, limit, search, status }));
  }, [dispatch, query, realTimeSearch]);

  const filteredItems = useMemo(() => {
    let filtered = employees || [];
    
    if (query.visa) {
      filtered = filtered.filter((e) => e.citizenshipStatus === query.visa);
    }

    if (realTimeSearch?.trim()) {
      const searchLower = realTimeSearch.toLowerCase().trim();
      filtered = filtered.filter((e) => {
        const firstName = (e?.firstName || '').toLowerCase();
        const lastName = (e?.lastName || '').toLowerCase();
        const preferredName = (e?.preferredName || '').toLowerCase();
        return firstName.includes(searchLower) || 
               lastName.includes(searchLower) || 
               preferredName.includes(searchLower);
      });
    }

    return filtered;
  }, [employees, query.visa, realTimeSearch]);

  const loading = employeesStatus === 'loading';

  // const handleChangePage = (page) => {
  //   setQuery((q) => ({ ...q, page }));
  // };

  // const onViewProfile = (employeeId) => {
  //   window.open(`/hr/hiring/review/${employeeId}`, '_blank', 'noopener,noreferrer');
  // };
  // const onViewDocuments = (employeeId) => navigate(`/hr/visa-status`);

  const handleRealTimeSearch = (value) => {
    setRealTimeSearch(value);
  };

  const searchResultMessage = useMemo(() => {
    if (!realTimeSearch?.trim()) return null;
    const count = filteredItems.length;
    if (count === 0) {
      return <Alert message="No records found" type="info" showIcon style={{ marginBottom: 16 }} />;
    } else if (count === 1) {
      return <Alert message="1 record found" type="success" showIcon style={{ marginBottom: 16 }} />;
    } else {
      return <Alert message={`${count} records found`} type="info" showIcon style={{ marginBottom: 16 }} />;
    }
  }, [realTimeSearch, filteredItems.length]);

  return (
    <div className="employee-profiles-page">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Typography>
          <Title level={3} style={{ margin: 0 }}>Employees</Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Search, filter, and browse employee profiles.
          </Paragraph>
        </Typography>

        <Card bordered={false} className="employee-profiles-card">
          <EmployeeSearch
            initial={{ search: query.search }}
            onSearchChange={handleRealTimeSearch}
          />
          {searchResultMessage}
          <EmployeeSummaryList
            items={filteredItems}
            loading={loading}
            total={pagination?.total || filteredItems.length}
          />
        </Card>
      </Space>
    </div>
  );
}