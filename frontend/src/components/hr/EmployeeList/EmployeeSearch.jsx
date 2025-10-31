import { Form, Input, Row, Col } from 'antd';
import { useState, useEffect, useRef } from 'react';
import './EmployeeSearch.css';

export default function EmployeeSearch({ initial = {}, onSearchChange }) {
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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    form.setFieldsValue({ search: value });
  };

  const handleClear = () => {
    setSearchValue('');
    form.setFieldsValue({ search: '' });
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  return (
    <div className="employee-search-container" style={{ marginBottom: 16 }}>
      <Row gutter={12}>
        <Col xs={24} md={24}>
          <Form.Item 
            name="search" 
            label="Search (First Name, Last Name, Preferred Name)"
          >
            <Input 
              placeholder="Type to search..." 
              allowClear 
              value={searchValue}
              onChange={handleSearchChange}
              onClear={handleClear}
              size="middle"
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
}