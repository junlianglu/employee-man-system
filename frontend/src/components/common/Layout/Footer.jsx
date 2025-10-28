import React from 'react';
import { Layout, Typography } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

export default function Footer({ text = '© Employee Management System', style }) {
  return (
    <AntFooter style={{ textAlign: 'center', ...style }}>
      <Text type="secondary">{text}</Text>
    </AntFooter>
  );
}