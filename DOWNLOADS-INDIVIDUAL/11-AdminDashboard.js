import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout, { adminMenuItems } from '../components/DashboardLayout';
import AdminHome from './admin/AdminHome';
import AdminProjects from './admin/AdminProjects';
import AdminTeams from './admin/AdminTeams';
import AdminDrawings from './admin/AdminDrawings';
import AdminMaterials from './admin/AdminMaterials';
import AdminSchedules from './admin/AdminSchedules';

const AdminDashboard = ({ user, onLogout }) => {
  return (
    <DashboardLayout user={user} onLogout={onLogout} menuItems={adminMenuItems}>
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="teams" element={<AdminTeams />} />
        <Route path="drawings" element={<AdminDrawings />} />
        <Route path="materials" element={<AdminMaterials />} />
        <Route path="schedules" element={<AdminSchedules />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;
