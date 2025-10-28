import React from 'react';
import { Alert } from 'antd';

const MAP_STATUS_TO_TYPE = {
  approved: 'success',
  success: 'success',
  pending: 'info',
  info: 'info',
  not_uploaded: 'warning',
  warning: 'warning',
  rejected: 'error',
  error: 'error',
};

export default function StatusMessage({
  status = 'info',          
  title,                    
  description,              
  showIcon = true,
  closable = false,
  onClose,
  action,                   
  type,                     
  style,
  ...rest
}) {
  const alertType = type || MAP_STATUS_TO_TYPE[status] || 'info';
  const message = title ?? (typeof status === 'string'
    ? status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Status');

  return (
    <Alert
      type={alertType}
      message={message}
      description={description}
      showIcon={showIcon}
      closable={closable}
      onClose={onClose}
      action={action}
      style={style}
      {...rest}
    />
  );
}