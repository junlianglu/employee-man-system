import React from 'react';
import { Tooltip } from 'antd';
import StatusBadge from '../Status/StatusBadge.jsx';

export default function DocumentStatus({ status, hrFeedback, variant = 'tag', size }) {
  const badge = <StatusBadge status={status} variant={variant} size={size} />;
  if (hrFeedback) {
    return <Tooltip title={hrFeedback}>{badge}</Tooltip>;
  }
  return badge;
}