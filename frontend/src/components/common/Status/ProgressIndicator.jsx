import React from 'react';
import { Steps, Progress } from 'antd';

export default function ProgressIndicator({
  steps,                
  current = 0,          
  percent,              
  progressType = 'line',
  status,               
  size,                 
  showInfo = true,          
  ...rest
}) {
  if (Array.isArray(steps) && steps.length > 0) {
    const items = steps.map((s) =>
      typeof s === 'string'
        ? { title: s }
        : { title: s.title, description: s.description, status: s.status }
    );
    return (
      <Steps
        current={current}
        items={items}
        size={size}
        {...rest}
      />
    );
  }

  return (
    <Progress
      type={progressType}
      percent={percent ?? 0}
      status={status}
      size={size}
      showInfo={showInfo}
      {...rest}
    />
  );
}