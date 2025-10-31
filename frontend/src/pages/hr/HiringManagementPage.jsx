import { useEffect, useMemo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, message } from 'antd';
import TokenGenerator from '../../components/hr/HiringManagement/TokenGenerator.jsx';
import TokenHistory from '../../components/hr/HiringManagement/TokenHistory.jsx';
import ApplicationReview from '../../components/hr/HiringManagement/ApplicationReview.jsx';

import {
  fetchRegistrationTokens,
  generateRegistrationToken,
} from '../../features/registrationToken/registrationTokenThunks.js';
import {
  selectRegistrationTokens,
  selectRegistrationTokensStatus,
  selectCreateRegistrationTokenStatus,
} from '../../features/registrationToken/registrationTokenSelectors.js';

import {
  fetchOnboardingApplications,
} from '../../features/employee/employeeThunks.js';
import {
  selectOnboardingApplications,
  selectOnboardingApplicationsStatus,
} from '../../features/employee/employeeSelectors.js';

export default function HiringManagementPage() {
  const dispatch = useDispatch();

  // Tokens
  const tokens = useSelector(selectRegistrationTokens);
  const tokensStatus = useSelector(selectRegistrationTokensStatus);
  const createStatus = useSelector(selectCreateRegistrationTokenStatus);

  useEffect(() => {
    dispatch(fetchRegistrationTokens());
  }, [dispatch]);

  const lastToken = useMemo(() => (tokens && tokens.length ? tokens[0] : null), [tokens]);

  const handleGenerate = useCallback(async (payload) => {
    try {
      const token = await dispatch(generateRegistrationToken(payload)).unwrap();
      if (token) message.success('Invite sent successfully');
      dispatch(fetchRegistrationTokens());
    } catch (e) {
      message.error(e?.message || 'Failed to generate token');
    }
  }, [dispatch]);

  // Applications
  const [filter, setFilter] = useState({ status: 'pending' });

  const apps = useSelector(selectOnboardingApplications);
  const appsStatus = useSelector(selectOnboardingApplicationsStatus);

  useEffect(() => {
    dispatch(fetchOnboardingApplications(filter));
  }, [dispatch, filter]);

  const handleRefreshList = () => dispatch(fetchOnboardingApplications(filter));

  return (
    <Row gutter={[16, 16]} style={{ padding: 16 }}>
      <Col xs={24} lg={10}>
        <TokenGenerator
          loading={createStatus === 'loading'}
          onGenerate={handleGenerate}
          lastToken={lastToken}
          onReset={() => {}}
        />
        <div style={{ height: 16 }} />
        <TokenHistory
          tokens={tokens}
          loading={tokensStatus === 'loading'}
          onRefresh={() => dispatch(fetchRegistrationTokens())}
        />
      </Col>

      <Col xs={24} lg={14}>
        <ApplicationReview
          applications={apps}
          listLoading={appsStatus === 'loading'}
          filter={filter}
          onChangeFilter={setFilter}
          onRefreshList={handleRefreshList}
        />
      </Col>
    </Row>
  );
}