import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import NotificationBell from './NotificationBell';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  FileText,
  Package,
  Calendar,
  LogOut,
  Building2,
  Upload,
  ClipboardList,
} from 'lucide-react';

const DashboardLayout = ({ user, onLogout, children, menuItems }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 sidebar-gradient text-slate-300 fixed h-full border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8 text-orange-600" strokeWidth={2} />
            <div>
              <h1 className="text-lg font-bold uppercase tracking-tight text-white">BuildTrack</h1>
              <p className="text-xs text-slate-400 uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                data-testid={item.testId}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-sm transition-all ${
                  active
                    ? 'bg-slate-800 text-white border-l-4 border-orange-600'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="font-medium text-sm uppercase tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="mb-4 p-3 bg-slate-800 rounded-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Signed in as</p>
            <p className="text-sm font-semibold text-white">{user.name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
          <Button
            onClick={onLogout}
            data-testid="logout-button"
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 rounded-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="text-sm uppercase tracking-wide">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64 flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
              {menuItems.find((item) => isActive(item.path))?.label || 'Dashboard'}
            </h2>
            <p className="text-sm text-slate-600">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationBell />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 graph-paper-bg">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;

export const adminMenuItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, testId: 'admin-nav-dashboard' },
  { path: '/admin/projects', label: 'Projects', icon: FolderKanban, testId: 'admin-nav-projects' },
  { path: '/admin/teams', label: 'Teams', icon: Users, testId: 'admin-nav-teams' },
  { path: '/admin/drawings', label: 'Drawings', icon: FileText, testId: 'admin-nav-drawings' },
  { path: '/admin/materials', label: 'Materials', icon: Package, testId: 'admin-nav-materials' },
  { path: '/admin/schedules', label: 'Schedules', icon: Calendar, testId: 'admin-nav-schedules' },
];

export const engineerMenuItems = [
  { path: '/engineer', label: 'Dashboard', icon: LayoutDashboard, testId: 'engineer-nav-dashboard' },
  { path: '/engineer/projects', label: 'My Projects', icon: FolderKanban, testId: 'engineer-nav-projects' },
  { path: '/engineer/drawings', label: 'Drawings', icon: Upload, testId: 'engineer-nav-drawings' },
  { path: '/engineer/materials', label: 'Materials', icon: ClipboardList, testId: 'engineer-nav-materials' },
];

export const clientMenuItems = [
  { path: '/client', label: 'Dashboard', icon: LayoutDashboard, testId: 'client-nav-dashboard' },
  { path: '/client/projects', label: 'Projects', icon: FolderKanban, testId: 'client-nav-projects' },
];
