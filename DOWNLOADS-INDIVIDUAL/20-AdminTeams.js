import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Users as UsersIcon } from 'lucide-react';

const AdminTeams = () => {
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    project_id: '',
    engineer_ids: [],
  });

  useEffect(() => {
    fetchTeams();
    fetchProjects();
    fetchEngineers();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await apiClient.get('/teams');
      setTeams(response.data);
    } catch (error) {
      toast.error('Failed to fetch teams');
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
      await apiClient.post('/teams', formData);
      toast.success('Team created successfully!');
      setOpen(false);
      setFormData({ name: '', project_id: '', engineer_ids: [] });
      fetchTeams();
    } catch (error) {
      toast.error('Failed to create team');
    }
  };

  const toggleEngineer = (engineerId) => {
    setFormData((prev) => ({
      ...prev,
      engineer_ids: prev.engineer_ids.includes(engineerId)
        ? prev.engineer_ids.filter((id) => id !== engineerId)
        : [...prev.engineer_ids, engineerId],
    }));
  };

  return (
    <div className="space-y-6" data-testid="admin-teams-page">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-900">Teams</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-team-button" className="bg-slate-900 text-white hover:bg-slate-800 rounded-sm btn-press">
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase tracking-tight">Create New Team</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-xs font-medium uppercase tracking-wider">Team Name</Label>
                <Input
                  required
                  data-testid="team-name-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 rounded-sm border-slate-300 bg-slate-50"
                />
              </div>
              <div>
                <Label className="text-xs font-medium uppercase tracking-wider">Project</Label>
                <select
                  required
                  data-testid="team-project-select"
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="mt-1 w-full rounded-sm border border-slate-300 bg-slate-50 p-2 text-sm"
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project.project_id} value={project.project_id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs font-medium uppercase tracking-wider mb-2 block">
                  Select Engineers
                </Label>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-200 rounded-sm p-3 bg-slate-50">
                  {engineers.map((engineer) => (
                    <div key={engineer.user_id} className="flex items-center">
                      <input
                        type="checkbox"
                        data-testid="team-engineer-checkbox"
                        checked={formData.engineer_ids.includes(engineer.user_id)}
                        onChange={() => toggleEngineer(engineer.user_id)}
                        className="mr-3 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{engineer.name}</p>
                        <p className="text-xs text-slate-600">{engineer.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" data-testid="submit-team-button" className="w-full bg-slate-900 text-white rounded-sm btn-press">
                Create Team
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => {
          const project = projects.find((p) => p.project_id === team.project_id);
          return (
            <Card key={team.team_id} className="border-slate-200 rounded-md technical-shadow" data-testid="team-card">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-lg font-semibold uppercase tracking-tight text-slate-900">
                  {team.name}
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">Project: {project?.name || 'Unknown'}</p>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center text-sm text-slate-600 mb-3">
                  <UsersIcon className="w-4 h-4 mr-2 text-slate-400" />
                  <span className="font-medium">{team.engineer_ids.length} Engineers</span>
                </div>
                <div className="space-y-2">
                  {team.engineer_ids.slice(0, 3).map((engineerId) => {
                    const engineer = engineers.find((e) => e.user_id === engineerId);
                    return engineer ? (
                      <div
                        key={engineerId}
                        className="text-xs bg-slate-50 p-2 rounded-sm border border-slate-200"
                      >
                        {engineer.name}
                      </div>
                    ) : null;
                  })}
                  {team.engineer_ids.length > 3 && (
                    <p className="text-xs text-slate-500">+{team.engineer_ids.length - 3} more</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminTeams;
