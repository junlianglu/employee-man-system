import { Table, Typography, Tag, Space } from 'antd';

const { Text } = Typography;

function getWorkAuthTitle(employee) {
  if (employee?.citizenshipStatus !== 'work_visa') {
    if (employee?.citizenshipStatus === 'citizen') return 'U.S. Citizen';
    if (employee?.citizenshipStatus === 'permanent_resident') return 'Permanent Resident';
    return 'N/A';
  }
  if (employee?.workAuthorizationType === 'Other') {
    return employee?.visaTitle || 'N/A';
  }
  return employee?.workAuthorizationType || 'N/A';
}

function getLegalFullName(employee) {
  const parts = [employee?.firstName, employee?.middleName, employee?.lastName].filter(Boolean);
  return parts.join(' ') || employee?.username || 'N/A';
}

export default function EmployeeSummaryList({
  items = [],
  loading = false,
  total = 0,
}) {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => {
        const name = getLegalFullName(record);
        const url = `/hr/hiring/review/${record._id}`;
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 500 }}
            onClick={(e) => {
              e.preventDefault();
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
          >
            {name}
          </a>
        );
      },
      sorter: (a, b) => {
        const aLast = a?.lastName || '';
        const bLast = b?.lastName || '';
        return aLast.localeCompare(bLast);
      },
      defaultSortOrder: 'ascend',
    },
    {
      title: 'SSN',
      dataIndex: 'ssn',
      key: 'ssn',
      render: (ssn) => ssn || <Text type="secondary">N/A</Text>,
    },
    {
      title: 'Work Authorization Title',
      key: 'workAuth',
      render: (_, record) => {
        const title = getWorkAuthTitle(record);
        return <Text>{title}</Text>;
      },
    },
    {
      title: 'Phone Number',
      key: 'phone',
      render: (_, record) => {
        const phone = record?.cellPhone || record?.workPhone;
        return phone ? <Text>{phone}</Text> : <Text type="secondary">N/A</Text>;
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => email || <Text type="secondary">N/A</Text>,
    },
  ];

  // Sort by last name alphabetically
  const sortedItems = [...items].sort((a, b) => {
    const aLast = (a?.lastName || '').toLowerCase();
    const bLast = (b?.lastName || '').toLowerCase();
    if (aLast < bLast) return -1;
    if (aLast > bLast) return 1;
    return 0;
  });

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <div>
        <Text strong>Total Employees: </Text>
        <Text>{total || sortedItems.length}</Text>
      </div>
      <Table
        columns={columns}
        dataSource={sortedItems}
        rowKey={(record) => record._id}
        loading={loading}
        pagination={false}
        size="middle"
      />
    </Space>
  );
}

