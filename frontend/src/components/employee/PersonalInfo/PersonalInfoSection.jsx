import React, { useEffect } from 'react';
import { Tabs, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProfile } from '../../../features/employee/employeeThunks.js';
import { selectMyProfile } from '../../../features/employee/employeeSelectors.js';
import NameSection from './NameSection.jsx';
import AddressSection from './AddressSection.jsx';
import ContactSection from './ContactSection.jsx';
import EmploymentSection from './EmploymentSection.jsx';
import EmergencyContactSection from './EmergencyContactSection.jsx';
import DocumentsReadOnlySection from './DocumentsReadOnlySection.jsx';

export default function PersonalInfoSection() {
  const dispatch = useDispatch();
  const profile = useSelector(selectMyProfile);

  useEffect(() => {
    if (!profile) dispatch(fetchMyProfile());
  }, [dispatch, profile]);

  const items = [
    { key: 'name', label: 'Name & Basic', children: <NameSection /> },
    { key: 'address', label: 'Address', children: <AddressSection /> },
    { key: 'contact', label: 'Contact', children: <ContactSection /> },
    { key: 'employment', label: 'Work Authorization', children: <EmploymentSection /> },
    { key: 'emergency', label: 'Emergency Contacts', children: <EmergencyContactSection /> },
    { key: 'documents', label: 'Documents', children: <DocumentsReadOnlySection /> },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Tabs items={items} />
    </Space>
  );
}