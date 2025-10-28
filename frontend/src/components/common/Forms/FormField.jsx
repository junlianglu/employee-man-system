import { Form, Tooltip } from 'antd';

export default function FormField({
  name,
  label,
  tooltip,
  rules = [],
  extra,
  dependencies,
  valuePropName,
  getValueFromEvent,
  normalize,
  children,
  hidden,
  style,
}) {
  const labelNode = tooltip ? (
    <span>
      {label}{' '}
      <Tooltip title={tooltip}>
        <span style={{ cursor: 'help' }}>ℹ️</span>
      </Tooltip>
    </span>
  ) : (
    label
  );

  return (
    <Form.Item
      name={name}
      label={labelNode}
      rules={rules}
      extra={extra}
      dependencies={dependencies}
      valuePropName={valuePropName}
      getValueFromEvent={getValueFromEvent}
      normalize={normalize}
      hidden={hidden}
      style={style}
    >
      {children}
    </Form.Item>
  );
}