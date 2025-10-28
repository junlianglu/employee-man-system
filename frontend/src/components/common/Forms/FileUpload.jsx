import { Upload, Form } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

function normFile(e) {
  if (Array.isArray(e)) return e;
  return e && e.fileList;
}

export default function FileUpload({
  name = 'file',
  label = 'Upload File',
  accept,
  maxCount = 1,
  listType = 'picture',
  drag = false,
  rules = [{ required: true, message: 'Please upload a file' }],
  extra,
}) {
  const UploadComp = drag ? Upload.Dragger : Upload;

  return (
    <Form.Item name={name} label={label} valuePropName="fileList" getValueFromEvent={normFile} rules={rules} extra={extra}>
      <UploadComp
        name="file"
        multiple={false}
        maxCount={maxCount}
        accept={accept}
        beforeUpload={() => false}
        listType={listType}
      >
        {drag ? (
          <>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">The file will be uploaded when you submit the form.</p>
          </>
        ) : (
          'Click to upload'
        )}
      </UploadComp>
    </Form.Item>
  );
}