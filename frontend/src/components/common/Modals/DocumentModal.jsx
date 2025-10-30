import { useEffect } from 'react';
import { Modal, Form, Select, Upload, Typography, Divider } from 'antd';
import { InboxOutlined, FileOutlined, FileImageOutlined, FilePdfOutlined } from '@ant-design/icons';

const detectType = (url) => {
  if (!url) return 'file';
  const u = url.toLowerCase();
  if (u.endsWith('.pdf')) return 'pdf';
  if (u.endsWith('.png') || u.endsWith('.jpg') || u.endsWith('.jpeg')) return 'image';
  return 'file';
};

export default function DocumentModal({
  open,
  title = 'Upload Document',
  allowedTypes = ['profile_picture', 'drivers_license', 'work_authorization', 'opt_receipt', 'opt_ead', 'i983', 'i20'],
  defaultType,
  document,
  uploading = false,
  onSubmit,
  onCancel,
}) {
  const [form] = Form.useForm();
  const isLockedType = Array.isArray(allowedTypes) && allowedTypes.length === 1;

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({ type: (isLockedType ? allowedTypes[0] : (defaultType || document?.type)) });
    }
  }, [open, defaultType, document, form, isLockedType, allowedTypes]);

  const handleOk = () => form.submit();

  const handleFinish = (values) => {
    const fileList = values.file || [];
    const file = fileList[0]?.originFileObj;
    onSubmit?.({ type: values.type, file });
  };

  const previewKind = detectType(document?.fileUrl);

  return (
    <Modal
      open={open}
      title={title}
      onOk={handleOk}
      onCancel={onCancel}
      okText={uploading ? 'Uploading...' : 'Upload'}
      okButtonProps={{ loading: uploading }}
      destroyOnClose
      centered
    >
      {document?.fileUrl && (
        <>
          <Typography.Title level={5} style={{ marginTop: 0 }}>Current File</Typography.Title>
          {previewKind === 'image' && (
            <img src={document.fileUrl} alt={document?.fileName || 'document'} style={{ width: '100%', maxHeight: 260, objectFit: 'contain', border: '1px solid #f0f0f0', borderRadius: 4 }} />
          )}
          {previewKind === 'pdf' && (
            <iframe title="preview" src={document.fileUrl} style={{ width: '100%', height: 300, border: '1px solid #f0f0f0', borderRadius: 4 }} />
          )}
          {previewKind === 'file' && (
            <Typography.Link href={document.fileUrl} target="_blank" rel="noreferrer">
              <FileOutlined /> {document?.fileName || 'Download current file'}
            </Typography.Link>
          )}
          <Divider />
        </>
      )}

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="type"
          label="Document Type"
          rules={[{ required: true, message: 'Please select a document type' }]}
        >
          {isLockedType ? (
            <Select disabled value={allowedTypes[0]}>
              <Select.Option value={allowedTypes[0]}>
                {allowedTypes[0].replace(/_/g, ' ')}
              </Select.Option>
            </Select>
          ) : (
            <Select placeholder="Select type">
              {allowedTypes.map((t) => (
                <Select.Option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <Form.Item
          name="file"
          label="New File"
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
          rules={[{ required: true, message: 'Please choose a file to upload' }]}
          extra="The file will be uploaded when you click Upload."
        >
          <Upload.Dragger
            name="file"
            multiple={false}
            maxCount={1}
            beforeUpload={() => false}
            accept=".png,.jpg,.jpeg,.pdf"
            listType="picture"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to select</p>
            <p className="ant-upload-hint">Accepted: PNG, JPG, JPEG, PDF</p>
          </Upload.Dragger>
        </Form.Item>

        {document?.status && (
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Status: <strong>{document.status}</strong>
            {document.hrFeedback ? ` • Feedback: ${document.hrFeedback}` : ''}
          </Typography.Paragraph>
        )}
      </Form>
    </Modal>
  );
}