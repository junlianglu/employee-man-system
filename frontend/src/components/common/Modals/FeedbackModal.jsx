import { useEffect } from 'react';
import { Modal, Form, Select, Input } from 'antd';

export default function FeedbackModal({
  open,
  title = 'Review Document',
  initialStatus = undefined,
  initialFeedback = '',
  submitting = false,
  onSubmit,
  onCancel,
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        status: initialStatus,
        hrFeedback: initialFeedback,
      });
    }
  }, [open, initialStatus, initialFeedback, form]);

  const handleOk = () => form.submit();

  const handleFinish = (values) => {
    onSubmit?.({ status: values.status, hrFeedback: values.hrFeedback?.trim() || '' });
  };

  return (
    <Modal
      open={open}
      title={title}
      onOk={handleOk}
      onCancel={onCancel}
      okText={submitting ? 'Submitting...' : 'Submit'}
      okButtonProps={{ loading: submitting }}
      destroyOnHidden
      centered
    >
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Form.Item
          name="status"
          label="Decision"
          rules={[{ required: true, message: 'Please select a decision' }]}
        >
          <Select placeholder="Select decision">
            <Select.Option value="approved">Approved</Select.Option>
            <Select.Option value="rejected">Rejected</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) => prev.status !== curr.status}
        >
          {({ getFieldValue }) => {
            const rejected = getFieldValue('status') === 'rejected';
            return (
              <Form.Item
                name="hrFeedback"
                label="Feedback"
                rules={[
                  { required: rejected, message: 'Feedback is required when rejecting' },
                  { max: 500, message: 'Max 500 characters' },
                ]}
              >
                <Input.TextArea rows={4} placeholder={rejected ? 'Provide reason for rejection' : 'Optional notes'} />
              </Form.Item>
            );
          }}
        </Form.Item>
      </Form>
    </Modal>
  );
}