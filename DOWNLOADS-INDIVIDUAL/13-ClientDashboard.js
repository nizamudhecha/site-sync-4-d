import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout, { clientMenuItems } from '../components/DashboardLayout';
import ClientHome from './client/ClientHome';
import ClientProjects from './client/ClientProjects';

const ClientDashboard = ({ user, onLogout }) => {
  return (
    <DashboardLayout user={user} onLogout={onLogout} menuItems={clientMenuItems}>
      <Routes>
        <Route index element={<ClientHome />} />
        <Route path="projects" element={<ClientProjects />} />
        <Route path="*" element={<Navigate to="/client" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default ClientDashboard;
