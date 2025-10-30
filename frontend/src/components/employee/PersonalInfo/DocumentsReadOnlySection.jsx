import React from 'react';
import { Space, Card } from 'antd';
import DocumentList from '../../common/Documents/DocumentList.jsx';

export default function DocumentsReadOnlySection() {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card bordered={false} title="My Documents">
        <DocumentList />
      </Card>
    </Space>
  );
}