import React, { useMemo } from 'react';
import { Space, Card } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import DocumentList from '../../common/Documents/DocumentList.jsx';
import { selectMyDocuments } from '../../../features/document/documentSelectors.js';
import { fetchMyDocuments } from '../../../features/document/documentThunks.js';

export default function DocumentsReadOnlySection() {
  const dispatch = useDispatch();
  const allDocuments = useSelector(selectMyDocuments);

  // Fetch documents if not already loaded (DocumentList will also fetch, but this ensures it)
  React.useEffect(() => {
    if (!allDocuments || allDocuments.length === 0) {
      dispatch(fetchMyDocuments());
    }
  }, [dispatch, allDocuments]);

  // Filter out profile_picture since it's displayed in Name & Basic section
  const filteredDocuments = useMemo(() => {
    if (!allDocuments) return undefined;
    return allDocuments.filter(doc => doc.type !== 'profile_picture');
  }, [allDocuments]);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card bordered={false} title="My Documents">
        <DocumentList documents={filteredDocuments} />
      </Card>
    </Space>
  );
}