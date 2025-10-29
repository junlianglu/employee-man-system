import React from 'react';
import { Typography, Space } from 'antd';
import PersonalInfoSection from '../../components/employee/PersonalInfo/PersonalInfoSection.jsx';

const { Title, Paragraph } = Typography;

export default function PersonalInfoPage() {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography>
        <Title level={3} style={{ margin: 0 }}>Personal Information</Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Update your name, address, contact information, work authorization, and emergency contacts.
        </Paragraph>
      </Typography>
      <PersonalInfoSection />
    </Space>
  );
}