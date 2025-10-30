import { useMemo, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, message, Typography, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ALLOWED_TYPES, viewDocument, downloadDocument } from '../../api/documents.js';
import { fetchOnboardingStatus, fetchMyProfile, updateMyProfileThunk } from '../../features/employee/employeeThunks.js';
import { selectOnboardingStatusData, selectOnboardingStatusState, selectMyProfile } from '../../features/employee/employeeSelectors.js';
import {
  fetchMyDocuments,
  uploadMyDocument,
} from '../../features/document/documentThunks.js';
import {
  selectMyDocuments,
  selectMyDocumentsStatus,
  selectMyUploadStatus,
} from '../../features/document/documentSelectors.js';
import DocumentStep from '../../components/employee/VisaStatus/DocumentStep.jsx';
import OnboardingForm from '../../components/employee/Onboarding/OnboardingForm.jsx';
import DocumentModal from '../../components/common/Modals/DocumentModal.jsx';

export default function OnboardingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onboarding = useSelector(selectOnboardingStatusData);
  const onboardingStatus = useSelector(selectOnboardingStatusState);
  const profile = useSelector(selectMyProfile);

  const myDocs = useSelector(selectMyDocuments);
  const myDocsStatus = useSelector(selectMyDocumentsStatus);
  const uploadStatus = useSelector(selectMyUploadStatus);

  const [modal, setModal] = useState({ open: false, doc: null });

  useEffect(() => {
    dispatch(fetchOnboardingStatus());
    dispatch(fetchMyDocuments());
    if (!profile) dispatch(fetchMyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (onboarding?.status === 'approved') {
      navigate('/employee', { replace: true });
    }
  }, [onboarding?.status, navigate]);

  const [formSnapshot, setFormSnapshot] = useState(null);

  const effectiveCitizenship = formSnapshot?.citizenshipStatus ?? profile?.citizenshipStatus;
  const effectiveWorkType = formSnapshot?.workAuthorizationType ?? profile?.workAuthorizationType;

  const visibleTypes = useMemo(() => {
    const types = ['profile_picture', 'drivers_license'];
    if (effectiveCitizenship === 'work_visa') {
      if (effectiveWorkType === 'F1(CPT/OPT)') {
        types.push('opt_receipt');
      } else {
        types.push('work_authorization');
      }
    }
    return types;
  }, [effectiveCitizenship, effectiveWorkType]);

  const docsByType = useMemo(() => {
    const map = new Map((myDocs || []).map((d) => [d.type, d]));
    return visibleTypes.map((t) => map.get(t) || { type: t });
  }, [myDocs, visibleTypes]);

  const requiredTypes = useMemo(() => {
    if (effectiveCitizenship === 'work_visa') {
      return new Set([effectiveWorkType === 'F1(CPT/OPT)' ? 'opt_receipt' : 'work_authorization']);
    }
    return new Set();
  }, [effectiveCitizenship, effectiveWorkType]);

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

  const renderFormSection = () => {
    const loading = onboardingStatus === 'loading';
    const status = onboarding?.status;
    if (loading) return (
      <Card loading title="Onboarding Application" />
    );

    if (status === 'pending') {
      return (
        <>
          <Card>
            <Alert type="info" showIcon message="Please wait for HR to review your application." />
          </Card>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24}>
              <Card title="Submitted Application (Read-only)">
                <OnboardingForm initialValues={profile || undefined} readOnly submitting={false} showAccount={false} showEmail={true} onValuesChange={setFormSnapshot} />
              </Card>
            </Col>
          </Row>
        </>
      );
    }

    // never_submitted or rejected -> editable form with possible feedback
    return (
      <>
        {status === 'rejected' && onboarding?.hrFeedback ? (
          <Card>
            <Alert
              type="error"
              showIcon
              message="Your application was rejected"
              description={onboarding.hrFeedback}
            />
          </Card>
        ) : null}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card title="Onboarding Application">
              <OnboardingForm
                initialValues={profile || undefined}
                submitting={false}
                showAccount={false}
                showEmail={true}
                onValuesChange={setFormSnapshot}
                onSubmit={async (values) => {
                  try {
                    const payload = { ...values, onboardingReview: { status: 'pending' } };
                    await dispatch(updateMyProfileThunk(payload)).unwrap();
                    message.success('Application submitted');
                    await dispatch(fetchOnboardingStatus());
                  } catch (e) {
                    message.error(e?.message || 'Failed to submit');
                  }
                }}
              />
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  return (
    <>
      <Row gutter={[16, 16]} style={{ padding: 16 }}>
        <Col xs={24}>
          {renderFormSection()}
        </Col>

        <Col xs={24}>
          <Card title="Documents (Optional unless specified)" loading={myDocsStatus === 'loading'}>
            {docsByType.map((doc) => (
              <DocumentStep
                key={doc.type}
                doc={doc}
                required={requiredTypes.has(doc.type)}
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
            await dispatch(uploadMyDocument({ type, file })).unwrap();
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