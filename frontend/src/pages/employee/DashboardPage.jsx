import React from 'react';
import { Row, Col, Card, Typography, Space, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  DashboardOutlined,
  IdcardOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { selectMyProfile } from '../../features/employee/employeeSelectors.js';

const { Title } = Typography;

export default function DashboardPage() {
  const navigate = useNavigate();
  const profile = useSelector(selectMyProfile);

  const navItems = [
    { to: '/employee/personal-info', label: 'Personal Info', icon: <IdcardOutlined />, description: 'View and edit your personal information' },
    { to: '/employee/visa-status', label: 'Visa Status', icon: <ApartmentOutlined />, description: 'Manage your visa documents and track status' },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card bordered={false}>
        <Title level={3} style={{ margin: 0 }}>
          Welcome{profile?.firstName ? `, ${profile.firstName}` : ''}!
        </Title>
      </Card>

      <Row gutter={[16, 16]}>
        {navItems.map((item) => (
          <Col xs={24} md={12} key={item.to}>
            <Card
              hoverable
              style={{ height: '100%' }}
              onClick={() => navigate(item.to)}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  {item.icon}
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {item.label}
                  </Typography.Title>
                </Space>
                <Typography.Text type="secondary">{item.description}</Typography.Text>
                <Button type="primary" block onClick={() => navigate(item.to)}>
                  Go to {item.label}
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
}
