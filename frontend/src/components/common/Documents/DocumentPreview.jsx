import React, { useEffect } from 'react';
import { Modal, Image, Skeleton, Button, Space, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { viewDocumentUrl, downloadDocumentThunk } from '../../../features/document/documentThunks.js';
import { clearPreview } from '../../../features/document/documentSlice.js';
import { selectPreview } from '../../../features/document/documentSelectors.js';

const { Text } = Typography;

export default function DocumentPreview({ open, onClose, doc, isHR = false }) {
  const dispatch = useDispatch();
  const preview = useSelector(selectPreview);

  useEffect(() => {
    if (open && doc?._id) {
      dispatch(viewDocumentUrl({ docId: doc._id, hr: isHR }));
    }
  }, [dispatch, open, doc?._id, isHR]);

  const handleCancel = () => {
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }
    dispatch(clearPreview());
    onClose?.();
  };

  const handleDownload = async () => {
    if (!doc?._id) return;
    const res = await dispatch(downloadDocumentThunk({ docId: doc._id, hr: isHR }));
    const payload = res?.payload;
    if (!payload?.blob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(payload.blob);
    link.download = payload.filename || 'document';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 0);
  };

  const isImage = (ct) => ct?.startsWith('image/');
  const isPdf = (ct) => ct === 'application/pdf';

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title={doc ? `Preview: ${doc.type?.replace(/_/g, ' ').toUpperCase()}` : 'Preview'}
      width={isImage(preview.contentType) ? 720 : 900}
      footer={
        <Space>
          <Button onClick={handleCancel}>Close</Button>
          <Button type="primary" onClick={handleDownload} disabled={!doc?._id}>
            Download
          </Button>
        </Space>
      }
      destroyOnHidden
    >
      {preview.status === 'loading' && <Skeleton active paragraph={{ rows: 8 }} />}
      {preview.status === 'failed' && (
        <Text type="danger">{preview.error || 'Failed to load preview.'}</Text>
      )}
      {preview.status === 'succeeded' && preview.url && (
        <>
          {isImage(preview.contentType) && (
            <Image src={preview.url} alt={preview.filename || 'document'} />
          )}
          {isPdf(preview.contentType) && (
            <iframe
              title={preview.filename || 'document'}
              src={preview.url}
              style={{ width: '100%', height: 600, border: 0 }}
            />
          )}
          {!isImage(preview.contentType) && !isPdf(preview.contentType) && (
            <Text>Preview not available for this file type. Use Download instead.</Text>
          )}
        </>
      )}
    </Modal>
  );
}