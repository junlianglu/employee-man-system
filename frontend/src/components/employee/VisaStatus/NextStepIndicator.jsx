import { Alert, Steps, Typography, Space } from 'antd';

function toLabel(type) {
  return (type || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function stepStatusFor(doc) {
  if (!doc) return 'wait';
  if (doc.status === 'approved') return 'finish';
  if (doc.status === 'rejected') return 'error';
  if (doc.status === 'pending') return 'process';
  return 'wait';
}

export default function NextStepIndicator({
  requiredTypes = [],
  documents = [],
}) {
  const byType = new Map((documents || []).map((d) => [d.type, d]));
  const steps = requiredTypes.map((t) => ({
    title: toLabel(t),
    status: stepStatusFor(byType.get(t)),
    feedback: byType.get(t)?.hrFeedback,
  }));

  const nextIndex = steps.findIndex((s) => s.status === 'error' || s.status === 'wait' || s.status === 'process');
  const current = nextIndex === -1 ? steps.length - 1 : nextIndex;

  const nextStep = steps.find((s) => s.status === 'error') ||
                   steps.find((s) => s.status === 'wait') ||
                   steps.find((s) => s.status === 'process');

  const message = nextStep
    ? nextStep.status === 'error'
      ? `Next step: Re-upload ${nextStep.title}`
      : nextStep.status === 'wait'
        ? `Next step: Upload ${nextStep.title}`
        : `In review: ${nextStep.title}`
    : 'All required documents are approved.';

  const description = nextStep?.feedback ? `Feedback: ${nextStep.feedback}` : undefined;

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Alert
        message={message}
        description={description}
        type={nextStep ? (nextStep.status === 'error' ? 'error' : nextStep.status === 'process' ? 'info' : 'warning') : 'success'}
        showIcon
      />
      <Steps current={current} items={steps.map((s) => ({ title: s.title, status: s.status }))} />
      {!nextStep && (
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          You’re all set. No further action needed.
        </Typography.Paragraph>
      )}
    </Space>
  );
}