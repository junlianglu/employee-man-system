import { useMemo, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, message } from 'antd';
import { ALLOWED_TYPES, viewDocument, downloadDocument } from '../../api/documents.js';
import { fetchOnboardingStatus } from '../../features/employee/employeeThunks.js';
import { selectOnboardingStatusData, selectOnboardingStatusState } from '../../features/employee/employeeSelectors.js';
import {
  fetchMyDocuments,
  uploadDocumentThunk,
} from '../../features/document/documentThunks.js';
import {
  selectMyDocuments,
  selectMyDocumentsStatus,
  selectUploadStatus,
} from '../../features/document/documentSelectors.js';
import NextStepIndicator from '../../components/employee/VisaStatus/NextStepIndicator.jsx';
import DocumentStep from '../../components/employee/VisaStatus/DocumentStep.jsx';
import DocumentModal from '../../components/common/Modals/DocumentModal.jsx';

export default function OnboardingPage() {
  const dispatch = useDispatch();

  const onboarding = useSelector(selectOnboardingStatusData);
  const onboardingStatus = useSelector(selectOnboardingStatusState);

  const myDocs = useSelector(selectMyDocuments);
  const myDocsStatus = useSelector(selectMyDocumentsStatus);
  const uploadStatus = useSelector(selectUploadStatus);

  const [modal, setModal] = useState({ open: false, doc: null });

  useEffect(() => {
    dispatch(fetchOnboardingStatus());
    dispatch(fetchMyDocuments());
  }, [dispatch]);

  const requiredTypes = ALLOWED_TYPES;

  const docsByType = useMemo(() => {
    const map = new Map((myDocs || []).map((d) => [d.type, d]));
    return requiredTypes.map((t) => map.get(t) || { type: t });
  }, [myDocs, requiredTypes]);

  const handleUploadClick = useCallback((doc) => {
    setModal({ open: true, doc });
  }, []);

  const handleView = useCallback(async (doc) => {
    if (!doc?._id) return;
    try {
      const { blob, contentType } = await viewDocument(doc._id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      message.error(e?.message || 'Failed to open document');
    }
  }, []);

  const handleDownload = useCallback(async (doc) => {
    if (!doc?._id) return;
    try {
      const { blob, filename } = await downloadDocument(doc._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'document';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      message.error(e?.message || 'Failed to download document');
    }
  }, []);

  return (
    <>
      <Row gutter={[16, 16]} style={{ padding: 16 }}>
        <Col xs={24}>
          <Card loading={onboardingStatus === 'loading'} title="Onboarding Progress">
            <NextStepIndicator requiredTypes={requiredTypes} documents={myDocs} />
          </Card>
        </Col>

        <Col xs={24}>
          <Card title="Required Documents" loading={myDocsStatus === 'loading'}>
            {docsByType.map((doc) => (
              <DocumentStep
                key={doc.type}
                doc={doc}
                onUpload={() => handleUploadClick(doc)}
                onView={() => handleView(doc)}
                onDownload={() => handleDownload(doc)}
                loading={uploadStatus === 'loading' && modal.doc?.type === doc.type}
              />
            ))}
          </Card>
        </Col>
      </Row>

      <DocumentModal
        open={modal.open}
        title="Upload Document"
        defaultType={modal.doc?.type}
        document={modal.doc?._id ? modal.doc : null}
        uploading={uploadStatus === 'loading'}
        onSubmit={async ({ type, file }) => {
          try {
            await dispatch(uploadDocumentThunk({ type, file })).unwrap();
            message.success('Document uploaded');
            setModal({ open: false, doc: null });
          } catch (e) {
            message.error(e?.message || 'Upload failed');
          }
        }}
        onCancel={() => setModal({ open: false, doc: null })}
      />
    </>
  );
}