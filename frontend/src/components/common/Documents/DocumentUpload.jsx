// frontend/src/components/common/Documents/DocumentUpload.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { Upload, Select, Button, Form, Space, message, Typography, Card } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { uploadMyDocument, fetchMyDocuments } from '../../../features/document/documentThunks.js';
import { selectMyUploadStatus } from '../../../features/document/documentSelectors.js';
import { ALLOWED_TYPES } from '../../../api/documents.js';

const { Dragger } = Upload;
const { Text } = Typography;

const typeLabel = (t) =>
  String(t || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function DocumentUpload({ 
  restrictedType,  // When provided, locks upload to this type only
  showTypeSelect = true,  // When false, hides the type selector (for restrictedType)
  compact = false  // If true, removes Card wrapper for inline use
}) {
  const dispatch = useDispatch();
  const uploadStatus = useSelector(selectMyUploadStatus);

  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  // If restrictedType is provided, auto-set it in form
  useEffect(() => {
    if (restrictedType) {
      form.setFieldsValue({ type: restrictedType });
    }
  }, [restrictedType, form]);

  const options = useMemo(
    () => ALLOWED_TYPES.map((t) => ({ label: typeLabel(t), value: t })),
    []
  );

  const beforeUpload = () => false;

  const onChange = ({ fileList: fl }) => {
    setFileList(fl.slice(-1));
  };

  const onRemove = () => {
    setFileList([]);
  };

  const onFinish = async (values) => {
    const file = fileList[0]?.originFileObj;
    const docType = restrictedType || values.type;
    
    if (!docType) {
      message.warning('Please select a document type.');
      return;
    }
    if (!file) {
      message.warning('Please select a file to upload.');
      return;
    }
    const res = await dispatch(uploadMyDocument({ type: docType, file }));
    if (res.error) {
      message.error(res.error.message || 'Upload failed');
      return;
    }
    message.success('Uploaded successfully');
    setFileList([]);
    form.resetFields();
    dispatch(fetchMyDocuments());
  };

  const uploading = uploadStatus === 'loading';

  const formContent = (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      {showTypeSelect && !restrictedType && (
        <Form.Item
          label="Document Type"
          name="type"
          rules={[{ required: true, message: 'Select a document type' }]}
        >
          <Select options={options} placeholder="Select a type" />
        </Form.Item>
      )}

      {restrictedType && (
        <Form.Item label="Document Type">
          <Text strong>{typeLabel(restrictedType)}</Text>
        </Form.Item>
      )}

      <Form.Item label="File">
        <Dragger
          multiple={false}
          accept=".jpg,.jpeg,.png,.pdf"
          beforeUpload={beforeUpload}
          onChange={onChange}
          onRemove={onRemove}
          fileList={fileList}
          disabled={uploading}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Supported: JPG, JPEG, PNG, PDF. Max 5MB.
          </p>
        </Dragger>
        {fileList.length === 1 && (
          <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
            Selected: {fileList[0].name}
          </Text>
        )}
      </Form.Item>

      <Form.Item>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={uploading}
            disabled={fileList.length === 0}
          >
            Upload
          </Button>
          <Button
            onClick={() => {
              setFileList([]);
              form.resetFields();
            }}
            disabled={uploading}
          >
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );

  if (compact) {
    return formContent;
  }

  return (
    <Card title="Upload Document" size="small" bordered={false} style={{ marginBottom: 16 }}>
      {formContent}
    </Card>
  );
}