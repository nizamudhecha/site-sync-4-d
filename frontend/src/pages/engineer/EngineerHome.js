import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { FolderKanban, CheckCircle, FileText, Package } from 'lucide-react';

const EngineerHome = () => {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchProjects();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/stats/engineer');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await apiClient.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  if (!stats) {
    return <div className="text-slate-600">Loading...</div>;
  }

  const statCards = [
    {
      title: 'Assigned Projects',
      value: stats.assigned_projects,
      icon: FolderKanban,
      color: 'text-slate-900',
      bgColor: 'bg-slate-100',
    },
    {
      title: 'Pending Drawings',
      value: stats.pending_drawings,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Approved Drawings',
      value: stats.approved_drawings,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="space-y-8" data-testid="engineer-home-page">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-slate-200 rounded-md technical-shadow" data-testid="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-sm`}>
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-xs font-medium uppercase tracking-wider text-slate-600 mt-1">
                  {stat.title}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Projects */}
      <Card className="border-slate-200 rounded-md" data-testid="assigned-projects-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold uppercase tracking-tight">My Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-sm text-slate-500">No projects assigned yet</p>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.project_id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-sm border border-slate-200"
                  data-testid="project-item"
                >
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{project.name}</p>
                    <p className="text-xs text-slate-600 mt-1">{project.location}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(project.start_date).toLocaleDateString()} -{' '}
                      {new Date(project.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-sm ${
                        project.status === 'Completed'
                          ? 'bg-green-100 text-green-700'
                          : project.status === 'In Progress'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {project.status}
                    </span>
                    <p className="text-sm font-semibold text-orange-600 mt-2">{project.progress}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EngineerHome;
