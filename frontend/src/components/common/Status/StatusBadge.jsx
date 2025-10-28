import React from 'react';
import { Tag, Badge } from 'antd';

const BADGE_STATUS = {
  not_uploaded: 'default',
  pending: 'processing',
  approved: 'success',
  rejected: 'error',
  info: 'processing',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

const TAG_COLOR = {
  not_uploaded: 'default',
  pending: 'blue',
  approved: 'green',
  rejected: 'red',
  info: 'blue',
  success: 'green',
  warning: 'gold',
  error: 'red',
};

function toLabel(status, label) {
  if (label) return label;
  return String(status || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({
  status = 'info',
  label,
  variant = 'tag', 
  text,            
  size,            
  style,
  ...rest
}) {
  const finalLabel = toLabel(status, label || text);
  if (variant === 'badge') {
    return (
      <Badge
        status={BADGE_STATUS[status] || 'default'}
        text={finalLabel}
        size={size}
        style={style}
        {...rest}
      />
    );
  }
  return (
    <Tag color={TAG_COLOR[status] || 'default'} style={style} {...rest}>
      {finalLabel}
    </Tag>
  );
}