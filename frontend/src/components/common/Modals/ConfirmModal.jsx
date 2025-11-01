import { Modal, Space, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

export default function ConfirmModal({
  open,
  title = 'Confirm',
  content,
  children,
  okText = 'Confirm',
  cancelText = 'Cancel',
  okType = 'primary',
  confirmLoading = false,
  centered = true,
  danger = false,
  onOk,
  onCancel,
  icon,
}) {
  const iconNode = icon ?? <ExclamationCircleOutlined style={{ color: danger ? '#ff4d4f' : '#faad14' }} />;

  return (
    <Modal
      open={open}
      title={title}
      onOk={onOk}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      okType={okType}
      okButtonProps={{ danger, loading: confirmLoading }}
      confirmLoading={confirmLoading}
      centered={centered}
      destroyOnHidden
    >
      <Space align="start">
        {iconNode}
        <div style={{ maxWidth: 520 }}>
          {children ? children : <Typography.Text>{content}</Typography.Text>}
        </div>
      </Space>
    </Modal>
  );
}