import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Calendar, Trash2 } from 'lucide-react';

const AdminSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    project_id: '',
    phase_name: '',
    start_date: '',
    end_date: '',
    description: '',
  });

  useEffect(() => {
    fetchSchedules();
    fetchProjects();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await apiClient.get('/schedules');
      setSchedules(response.data);
    } catch (error) {
      toast.error('Failed to fetch schedules');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/schedules', formData);
      toast.success('Schedule created successfully!');
      setOpen(false);
      setFormData({ project_id: '', phase_name: '', start_date: '', end_date: '', description: '' });
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to create schedule');
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await apiClient.delete(`/schedules/${scheduleId}`);
      toast.success('Schedule deleted successfully');
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to delete schedule');
    }
  };

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.project_id]) {
      acc[schedule.project_id] = [];
    }
    acc[schedule.project_id].push(schedule);
    return acc;
  }, {});

  return (
    <div className="space-y-6" data-testid="admin-schedules-page">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-900">Project Schedules</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-schedule-button" className="bg-slate-900 text-white hover:bg-slate-800 rounded-sm btn-press">
              <Plus className="w-4 h-4 mr-2" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase tracking-tight">Create New Schedule</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-xs font-medium uppercase tracking-wider">Project</Label>
                <select
                  required
                  data-testid="schedule-project-select"
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
                <Label className="text-xs font-medium uppercase tracking-wider">Phase Name</Label>
                <Input
                  required
                  data-testid="schedule-phase-input"
                  value={formData.phase_name}
                  onChange={(e) => setFormData({ ...formData, phase_name: e.target.value })}
                  placeholder="e.g., Foundation Work"
                  className="mt-1 rounded-sm border-slate-300 bg-slate-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium uppercase tracking-wider">Start Date</Label>
                  <Input
                    type="date"
                    required
                    data-testid="schedule-start-date-input"
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
                    data-testid="schedule-end-date-input"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="mt-1 rounded-sm border-slate-300 bg-slate-50"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium uppercase tracking-wider">Description</Label>
                <Textarea
                  data-testid="schedule-description-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  className="mt-1 rounded-sm border-slate-300 bg-slate-50"
                  rows={3}
                />
              </div>
              <Button type="submit" data-testid="submit-schedule-button" className="w-full bg-slate-900 text-white rounded-sm btn-press">
                Create Schedule
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedSchedules).map(([projectId, projectSchedules]) => {
          const project = projects.find((p) => p.project_id === projectId);
          return (
            <Card key={projectId} className="border-slate-200 rounded-md technical-shadow" data-testid="project-schedule-card">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-lg font-semibold uppercase tracking-tight text-slate-900">
                  {project?.name || 'Unknown Project'}
                </CardTitle>
                <p className="text-sm text-slate-600">{project?.location}</p>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {projectSchedules.map((schedule) => (
                    <div
                      key={schedule.schedule_id}
                      className="flex items-start justify-between p-4 bg-slate-50 rounded-sm border border-slate-200"
                      data-testid="schedule-item"
                    >
                      <div className="flex items-start space-x-3 flex-1">
                        <Calendar className="w-5 h-5 text-orange-600 mt-0.5" strokeWidth={1.5} />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-slate-900">{schedule.phase_name}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            {new Date(schedule.start_date).toLocaleDateString()} -{' '}
                            {new Date(schedule.end_date).toLocaleDateString()}
                          </p>
                          {schedule.description && (
                            <p className="text-xs text-slate-500 mt-2">{schedule.description}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-testid="delete-schedule-button"
                        onClick={() => handleDelete(schedule.schedule_id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {schedules.length === 0 && (
          <p className="text-center text-slate-500 py-8">No schedules created yet</p>
        )}
      </div>
    </div>
  );
};

export default AdminSchedules;
