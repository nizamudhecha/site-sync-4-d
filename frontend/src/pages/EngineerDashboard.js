import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout, {
  engineerMenuItems,
} from "../components/DashboardLayout";

import EngineerHome from "./engineer/EngineerHome";
import EngineerProjects from "./engineer/EngineerProjects";
import EngineerDrawings from "./engineer/EngineerDrawings";
import EngineerMaterials from "./engineer/EngineerMaterials";

import EngineerSchedules from "./engineer/EngineerSchedules"; // ✅ NEW IMPORT

const EngineerDashboard = ({ user, onLogout }) => {
  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      menuItems={engineerMenuItems}>
      <Routes>
        {/* Dashboard Home */}
        <Route index element={<EngineerHome />} />

        {/* Projects */}
        <Route path="projects" element={<EngineerProjects />} />

        {/* ✅ Schedule Page */}
        <Route path="schedule/:projectId" element={<EngineerSchedules />} />

        {/* Drawings */}
        <Route path="drawings/:projectId" element={<EngineerDrawings />} />

        {/* Materials */}
        <Route path="materials/:projectId" element={<EngineerMaterials />} />

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/engineer" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default EngineerDashboard;
