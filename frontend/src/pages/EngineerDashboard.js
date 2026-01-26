import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout, { engineerMenuItems } from '../components/DashboardLayout';
import EngineerHome from './engineer/EngineerHome';
import EngineerProjects from './engineer/EngineerProjects';
import EngineerDrawings from './engineer/EngineerDrawings';
import EngineerMaterials from './engineer/EngineerMaterials';

const EngineerDashboard = ({ user, onLogout }) => {
  return (
    <DashboardLayout user={user} onLogout={onLogout} menuItems={engineerMenuItems}>
      <Routes>
        <Route index element={<EngineerHome />} />
        <Route path="projects" element={<EngineerProjects />} />
        <Route path="drawings" element={<EngineerDrawings />} />
        <Route path="materials" element={<EngineerMaterials />} />
        <Route path="*" element={<Navigate to="/engineer" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default EngineerDashboard;
