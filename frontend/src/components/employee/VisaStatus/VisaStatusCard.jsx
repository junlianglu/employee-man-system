import { Card, Descriptions, Tag, Space, Progress, Typography } from 'antd';
import dayjs from 'dayjs';

function statusTag(citizenshipStatus) {
  if (citizenshipStatus === 'work_visa') return <Tag color="blue">Work Visa</Tag>;
  if (citizenshipStatus === 'permanent_resident') return <Tag color="green">Permanent Resident</Tag>;
  if (citizenshipStatus === 'citizen') return <Tag color="green">U.S. Citizen</Tag>;
  return <Tag>Unknown</Tag>;
}

export default function VisaStatusCard({
  citizenshipStatus,
  workAuthorizationType,
  visaTitle,
  visaStartDate,
  visaEndDate,
  documents = [],
  header = 'Visa Status',
}) {
  const total = documents.length || 0;
  const approved = documents.filter((d) => d.status === 'approved').length;
  const progress = total ? Math.round((approved / total) * 100) : 0;

  const end = visaEndDate ? dayjs(visaEndDate) : null;
  const daysLeft = end ? end.diff(dayjs(), 'day') : null;
  const dateRange = visaStartDate || visaEndDate
    ? `${visaStartDate ? dayjs(visaStartDate).format('YYYY-MM-DD') : '—'} → ${visaEndDate ? end.format('YYYY-MM-DD') : '—'}`
    : '—';

  return (
    <Card title={header} bordered>
      <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
        <Descriptions column={1} size="small" labelStyle={{ width: 160 }}>
          <Descriptions.Item label="Citizenship">{statusTag(citizenshipStatus)}</Descriptions.Item>
          <Descriptions.Item label="Work Auth Type">{workAuthorizationType || '—'}</Descriptions.Item>
          <Descriptions.Item label="Visa Title">{visaTitle || '—'}</Descriptions.Item>
          <Descriptions.Item label="Validity">{dateRange}</Descriptions.Item>
          {daysLeft !== null && (
            <Descriptions.Item label="Days Remaining">
              <Typography.Text type={daysLeft <= 30 ? 'danger' : daysLeft <= 90 ? 'warning' : undefined}>
                {daysLeft} day{daysLeft === 1 ? '' : 's'}
              </Typography.Text>
            </Descriptions.Item>
          )}
        </Descriptions>

        <div style={{ textAlign: 'center', minWidth: 160 }}>
          <Progress type="dashboard" percent={progress} />
          <Typography.Text type="secondary">
            {approved}/{total} approved
          </Typography.Text>
        </div>
      </Space>
    </Card>
  );
}