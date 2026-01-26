import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { Plus, MapPin, DollarSign, Calendar, Users as UsersIcon } from 'lucide-react';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [open, setOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedEngineers, setSelectedEngineers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    client_name: '',
    location: '',
    start_date: '',
    end_date: '',
    budget: '',
  });

  useEffect(() => {
    fetchProjects();
    fetchEngineers();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await apiClient.get('/projects');
      setProjects(response.data);
    } catch (error) {
      toast.error('Failed to fetch projects');
    }
  };

  const fetchEngineers = async () => {
    try {
      const response = await apiClient.get('/users?role=Engineer');
      setEngineers(response.data);
    } catch (error) {
      console.error('Failed to fetch engineers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/projects', {
        ...formData,
        budget: parseFloat(formData.budget),
      });
      toast.success('Project created successfully!');
      setOpen(false);
      setFormData({ name: '', client_name: '', location: '', start_date: '', end_date: '', budget: '' });
      fetchProjects();
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleAssignEngineers = async () => {
    if (!selectedProject || selectedEngineers.length === 0) {
      toast.error('Please select at least one engineer');
      return;
    }
    try {
      await apiClient.post(`/projects/${selectedProject.project_id}/assign`, selectedEngineers);
      toast.success('Engineers assigned successfully!');
      setAssignOpen(false);
      setSelectedEngineers([]);
      fetchProjects();
    } catch (error) {
      toast.error('Failed to assign engineers');
    }
  };

  const toggleEngineerSelection = (engineerId) => {
    setSelectedEngineers((prev) =>
      prev.includes(engineerId) ? prev.filter((id) => id !== engineerId) : [...prev, engineerId]
    );
  };

  const updateProjectStatus = async (projectId, status) => {
    try {
      await apiClient.put(`/projects/${projectId}`, { status });
      toast.success('Project status updated');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-projects-page">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-900">All Projects</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-project-button" className="bg-slate-900 text-white hover:bg-slate-800 rounded-sm btn-press">
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase tracking-tight">Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium uppercase tracking-wider">Project Name</Label>
                  <Input
                    required
                    data-testid="project-name-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 rounded-sm border-slate-300 bg-slate-50"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium uppercase tracking-wider">Client Name</Label>
                  <Input
                    required
                    data-testid="project-client-input"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="mt-1 rounded-sm border-slate-300 bg-slate-50"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium uppercase tracking-wider">Location</Label>
                <Input
                  required
                  data-testid="project-location-input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1 rounded-sm border-slate-300 bg-slate-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium uppercase tracking-wider">Start Date</Label>
                  <Input
                    type="date"
                    required
                    data-testid="project-start-date-input"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="mt-1 rounded-sm border-slate-300 bg-slate-50"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium uppercase tracking-wider">End Date</Label>
                  <Input
                    type="date"
                    required
                    data-testid="project-end-date-input"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="mt-1 rounded-sm border-slate-300 bg-slate-50"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium uppercase tracking-wider">Budget</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  data-testid="project-budget-input"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="mt-1 rounded-sm border-slate-300 bg-slate-50"
                />
              </div>
              <Button type="submit" data-testid="submit-project-button" className="w-full bg-slate-900 text-white rounded-sm btn-press">
                Create Project
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.project_id} className="border-slate-200 rounded-md technical-shadow" data-testid="project-card">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-lg font-semibold uppercase tracking-tight text-slate-900">
                {project.name}
              </CardTitle>
              <div className="flex items-center justify-between mt-2">
                <Select
                  value={project.status}
                  onValueChange={(value) => updateProjectStatus(project.project_id, value)}
                >
                  <SelectTrigger data-testid="project-status-select" className="w-32 rounded-sm text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm font-semibold text-orange-600">{project.progress}%</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center text-sm text-slate-600">
                <UsersIcon className="w-4 h-4 mr-2 text-slate-400" />
                <span className="font-medium">Client:</span>
                <span className="ml-2">{project.client_name}</span>
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                <span>{project.location}</span>
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                <span>{new Date(project.start_date).toLocaleDateString()}</span>
                <span className="mx-2">-</span>
                <span>{new Date(project.end_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
                <span className="font-semibold">${project.budget.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
                  Assigned Engineers: {project.assigned_engineers.length}
                </p>
                <Button
                  size="sm"
                  data-testid="assign-engineers-button"
                  onClick={() => {
                    setSelectedProject(project);
                    setSelectedEngineers(project.assigned_engineers);
                    setAssignOpen(true);
                  }}
                  className="w-full bg-white border border-slate-300 text-slate-900 hover:bg-slate-50 rounded-sm text-xs"
                >
                  Manage Engineers
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assign Engineers Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase tracking-tight">
              Assign Engineers to {selectedProject?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {engineers.map((engineer) => (
              <div
                key={engineer.user_id}
                className="flex items-center p-3 bg-slate-50 rounded-sm border border-slate-200"
              >
                <input
                  type="checkbox"
                  data-testid="engineer-checkbox"
                  checked={selectedEngineers.includes(engineer.user_id)}
                  onChange={() => toggleEngineerSelection(engineer.user_id)}
                  className="mr-3 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <div>
                  <p className="font-semibold text-sm text-slate-900">{engineer.name}</p>
                  <p className="text-xs text-slate-600">{engineer.email}</p>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={handleAssignEngineers} data-testid="confirm-assign-button" className="w-full bg-slate-900 rounded-sm btn-press">
            Assign Engineers
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProjects;
