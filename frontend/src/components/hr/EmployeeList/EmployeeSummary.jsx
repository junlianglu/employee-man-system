import { List, Empty, Pagination, Space } from 'antd';
import EmployeeCard from './EmployeeCard.jsx';

export default function EmployeeSummary({
  items = [],
  loading = false,
  pagination,
  onChangePage,
  onViewProfile,
  onViewDocuments,
  grid = { gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 4 },
}) {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <List
        grid={grid}
        dataSource={items}
        loading={loading}
        locale={{ emptyText: <Empty description="No employees found" /> }}
        renderItem={(e) => (
          <List.Item key={e._id}>
            <EmployeeCard
              employee={e}
              onViewProfile={onViewProfile}
              onViewDocuments={onViewDocuments}
            />
          </List.Item>
        )}
      />
      {pagination?.total ? (
        <Pagination
          current={pagination.page || 1}
          pageSize={pagination.limit || 10}
          total={pagination.total || 0}
          showSizeChanger={false}
          onChange={onChangePage}
          style={{ alignSelf: 'center' }}
        />
      ) : null}
    </Space>
  );
}