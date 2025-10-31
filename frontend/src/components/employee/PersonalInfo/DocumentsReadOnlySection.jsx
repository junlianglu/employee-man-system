import React, { useMemo } from 'react';
import { Space, Card } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import DocumentList from '../../common/Documents/DocumentList.jsx';
import { selectMyDocuments, selectMyDocumentsStatus } from '../../../features/document/documentSelectors.js';
import { fetchMyDocuments } from '../../../features/document/documentThunks.js';
import './DocumentsReadOnlySection.css';

export default function DocumentsReadOnlySection() {
  const dispatch = useDispatch();
  const allDocuments = useSelector(selectMyDocuments);
  const documentsStatus = useSelector(selectMyDocumentsStatus);

  // Fetch documents only if status is 'idle' (not yet fetched)
  React.useEffect(() => {
    if (documentsStatus === 'idle') {
      dispatch(fetchMyDocuments()).catch((err) => {
        console.error('Failed to fetch documents:', err);
      });
    }
  }, [dispatch, documentsStatus]);

  // Filter out profile_picture since it's displayed in Name & Basic section
  const filteredDocuments = useMemo(() => {
    if (documentsStatus === 'loading' || documentsStatus === 'idle') {
      return undefined; // Don't show documents while loading
    }
    // Once loaded (succeeded or failed), show the filtered list (even if empty)
    return (allDocuments || []).filter(doc => doc.type !== 'profile_picture');
  }, [allDocuments, documentsStatus]);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card 
        bordered={false} 
        title="My Documents"
        className="documents-card"
      >
        <DocumentList documents={filteredDocuments} />
      </Card>
    </Space>
  );
}