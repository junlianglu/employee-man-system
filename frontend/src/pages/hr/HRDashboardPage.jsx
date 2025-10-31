import React from 'react';
import { Row, Col, Card, Typography, Space, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  SolutionOutlined,
  TeamOutlined,
  AuditOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

export default function HRDashboardPage() {
  const navigate = useNavigate();

  const navItems = [
    { to: '/hr/hiring', label: 'Hiring', icon: <SolutionOutlined />, description: 'Generate registration tokens and review onboarding applications' },
    { to: '/hr/employees', label: 'Employees', icon: <TeamOutlined />, description: 'View and manage employee profiles' },
    { to: '/hr/visa', label: 'Visa Management', icon: <AuditOutlined />, description: 'Manage visa status and review documents' },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card bordered={false}>
      <Title level={3} style={{ margin: 0 }}>HR Dashboard</Title>
      </Card>

      <Row gutter={[16, 16]}>
        {navItems.map((item) => (
          <Col xs={24} md={8} key={item.to}>
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
