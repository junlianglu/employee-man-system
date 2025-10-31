import { Form, Input, Row, Col, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useState, useEffect, useRef } from 'react';

export default function EmployeeSearch({ initial = {}, onSearch, onSearchChange }) {
  const [form] = Form.useForm();
  const [searchValue, setSearchValue] = useState(initial.search || '');
  const debounceTimer = useRef(null);

  // Real-time search on every key press
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(searchValue);
      }
    }, 300); // Debounce 300ms

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchValue, onSearchChange]);

  const handleFinish = (values) => {
    const cleaned = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    );
    onSearch?.(cleaned);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    form.setFieldsValue({ search: value });
  };

  return (
    <Form
      layout="vertical"
      form={form}
      initialValues={initial}
      onFinish={handleFinish}
      style={{ marginBottom: 16 }}
    >
      <Row gutter={12}>
        <Col xs={24} md={10}>
          <Form.Item name="search" label="Search (First Name, Last Name, Preferred Name)">
            <Input 
              placeholder="Type to search..." 
              allowClear 
              value={searchValue}
              onChange={handleSearchChange}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={6} style={{ display: 'flex', alignItems: 'end' }}>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => { form.resetFields(); onSearch?.({}); }}>
              Reset
            </Button>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              Search
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  );
}