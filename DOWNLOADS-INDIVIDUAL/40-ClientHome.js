import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { FolderKanban, Calendar, MapPin } from 'lucide-react';
import { Progress } from '../../components/ui/progress';

const ClientHome = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await apiClient.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  return (
    <div className="space-y-8" data-testid="client-home-page">
      <div>
        <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-900 mb-2">Your Projects</h3>
        <p className="text-sm text-slate-600">View and track your construction projects</p>
      </div>

      {projects.length === 0 ? (
        <Card className="border-slate-200 rounded-md">
          <CardContent className="p-12 text-center">
            <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No projects available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card key={project.project_id} className="border-slate-200 rounded-md technical-shadow" data-testid="project-card">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-lg font-semibold uppercase tracking-tight text-slate-900">
                  {project.name}
                </CardTitle>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-600 font-medium">Project Progress</span>
                    <span className="font-semibold text-orange-600">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Status</p>
                  <span
                    className={`inline-block text-xs font-medium px-2 py-1 rounded-sm ${
                      project.status === 'Completed'
                        ? 'bg-green-100 text-green-700'
                        : project.status === 'In Progress'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                  <span>{project.location}</span>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Timeline</p>
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                    <span>{new Date(project.start_date).toLocaleDateString()}</span>
                    <span className="mx-2">-</span>
                    <span>{new Date(project.end_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Budget</p>
                  <p className="text-lg font-bold text-slate-900">${project.budget.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientHome;
