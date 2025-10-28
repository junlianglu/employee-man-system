import { Row, Col, Form, Radio, Select, DatePicker, Input } from 'antd';

export default function WorkAuthorizationForm({
  citizenshipName = 'citizenshipStatus',
  workTypeName = 'workAuthorizationType',
  visaTitleName = 'visaTitle',
  visaStartName = 'visaStartDate',
  visaEndName = 'visaEndDate',
}) {
  return (
    <>
      <Form.Item
        name={citizenshipName}
        label="Citizenship Status"
        rules={[{ required: true, message: 'Please select your status' }]}
      >
        <Radio.Group>
          <Radio value="citizen">U.S. Citizen</Radio>
          <Radio value="permanent_resident">Permanent Resident</Radio>
          <Radio value="work_visa">Work Visa</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item noStyle shouldUpdate={(prev, curr) => prev[citizenshipName] !== curr[citizenshipName] }>
        {({ getFieldValue }) => {
          const isWorkVisa = getFieldValue(citizenshipName) === 'work_visa';
          if (!isWorkVisa) return null;
          return (
            <>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name={workTypeName}
                    label="Work Authorization Type"
                    rules={[{ required: true, message: 'Required for work visa' }]}
                  >
                    <Select placeholder="Select type">
                      <Select.Option value="h1b">H-1B</Select.Option>
                      <Select.Option value="l1">L-1</Select.Option>
                      <Select.Option value="opt">OPT</Select.Option>
                      <Select.Option value="stem_opt">STEM OPT</Select.Option>
                      <Select.Option value="other">Other</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name={visaTitleName} label="Visa Title" rules={[{ max: 60 }] }>
                    <Input placeholder="e.g., Software Engineer" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name={visaStartName}
                    label="Visa Start Date"
                    rules={[{ required: true, message: 'Start date is required' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name={visaEndName}
                    label="Visa End Date"
                    rules={[{ required: true, message: 'End date is required' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </>
          );
        }}
      </Form.Item>
    </>
  );
}

