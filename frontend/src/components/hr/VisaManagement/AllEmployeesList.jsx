import { useMemo, useState } from 'react';
import { Card, Table, Button, Space, Tag, Typography, Input, Popover, Empty } from 'antd';
import { EyeOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './AllEmployeesList.css';

const { Text } = Typography;

function citizenshipTag(c) {
  if (c === 'work_visa') return <Tag color="blue">Work Visa</Tag>;
  if (c === 'permanent_resident') return <Tag color="green">Permanent Resident</Tag>;
  if (c === 'citizen') return <Tag color="green">U.S. Citizen</Tag>;
  return <Tag>Unknown</Tag>;
}

function daysLeft(visaEndDate) {
  if (!visaEndDate) return null;
  return dayjs(visaEndDate).diff(dayjs(), 'day');
}

export default function AllEmployeesList({
  items = [],
  loading = false,
  pagination,
  onChangePage,
  onViewDocument,
  onDownloadDocument,
  searchValue = '',
  onSearchChange,
}) {
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const filteredItems = useMemo(() => {
    if (!searchValue?.trim()) return items;
    const searchLower = searchValue.toLowerCase().trim();
    return items.filter((e) => {
      const firstName = (e?.firstName || '').toLowerCase();
      const lastName = (e?.lastName || '').toLowerCase();
      const preferredName = (e?.preferredName || '').toLowerCase();
      return firstName.includes(searchLower) || lastName.includes(searchLower) || preferredName.includes(searchLower);
    });
  }, [items, searchValue]);

  const columns = useMemo(() => [
    {
      title: 'Name (Legal Full Name)',
      key: 'name',
      render: (_, r) => {
        const fullName = `${r.firstName || ''} ${r.middleName || ''} ${r.lastName || ''}`.trim();
        return fullName || r.preferredName || r.username;
      },
      ellipsis: true,
      width: 150,
      fixed: 'left',
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email', 
      ellipsis: true,
      width: 180,
    },
    {
      title: 'Citizenship',
      dataIndex: 'citizenshipStatus',
      key: 'citizenshipStatus',
      render: (v) => citizenshipTag(v),
      width: 120,
    },
    {
      title: 'Work Auth',
      dataIndex: 'workAuthorizationType',
      key: 'workAuthorizationType',
      render: (v) => v || '—',
      width: 120,
    },
    {
      title: 'Visa Validity',
      key: 'validity',
      render: (_, r) =>
        r.visaStartDate || r.visaEndDate
          ? `${r.visaStartDate ? dayjs(r.visaStartDate).format('YYYY-MM-DD') : '—'} → ${r.visaEndDate ? dayjs(r.visaEndDate).format('YYYY-MM-DD') : '—'}`
          : '—',
      width: 180,
    },
    {
      title: 'Days Left',
      key: 'days',
      render: (_, r) => {
        const d = daysLeft(r.visaEndDate);
        if (d === null) return '—';
        return (
          <Text type={d <= 30 ? 'danger' : d <= 90 ? 'warning' : undefined}>
            {d}
          </Text>
        );
      },
      sorter: (a, b) => (daysLeft(a.visaEndDate) ?? Number.MAX_SAFE_INTEGER) - (daysLeft(b.visaEndDate) ?? Number.MAX_SAFE_INTEGER),
      width: 100,
    },
    {
      title: 'Approved&uploaded Documents',
      key: 'documents',
      render: (_, r) => {
        const approvedDocs = (r.documents || []).filter(d => d && d.status === 'approved');
        if (approvedDocs.length === 0) return <Text type="secondary">None</Text>;
        return (
          <Popover
            content={
              <Space direction="vertical" size={8} style={{ minWidth: 200 }}>
                {approvedDocs.map((doc) => (
                  <Space key={doc._id || doc.type} style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Text>{doc.type?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</Text>
                    <Space>
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => onViewDocument?.(r._id, doc._id)}
                      />
                      <Button
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => onDownloadDocument?.(r._id, doc._id)}
                      />
                    </Space>
                  </Space>
                ))}
              </Space>
            }
            title="Approved Documents"
            trigger="click"
          >
            <Button type="link">{approvedDocs.length} document(s)</Button>
          </Popover>
        );
      },
      width: 150,
    },
  ], [onViewDocument, onDownloadDocument]);

  const searchResultsInfo = useMemo(() => {
    if (!searchValue?.trim()) return null;
    const count = filteredItems.length;
    if (count === 0) return <Text type="secondary">No records found</Text>;
    if (count === 1) return <Text type="success">1 record found</Text>;
    return <Text type="success">{count} records found</Text>;
  }, [searchValue, filteredItems.length]);

  return (
    <Card
      title="All Visa Status Employees"
      extra={
        <Space className="all-employees-search-wrapper">
          {searchResultsInfo}
          <Input
            placeholder="Search by first name, last name, preferred name..."
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            allowClear
            className="all-employees-search"
            style={{ width: 300, maxWidth: '100%' }}
          />
        </Space>
      }
      className="all-employees-list-card"
    >
      {filteredItems.length === 0 && !loading && (
        <Empty
          description={
            searchValue ? 'No employees found matching your search.' : 'No employees found.'
          }
        />
      )}
      <div style={{ overflowX: 'auto' }}>
        <Table
          rowKey={(r) => r._id}
          columns={columns}
          dataSource={filteredItems}
          loading={loading}
          pagination={pagination ? {
            current: pagination.page || 1,
            pageSize: pagination.limit || 10,
            total: pagination.total || 0,
            showSizeChanger: false,
            onChange: onChangePage,
          } : false}
          scroll={{ x: 'max-content' }}
          size="middle"
        />
      </div>
    </Card>
  );
}

