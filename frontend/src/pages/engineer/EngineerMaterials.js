import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Package, CheckCircle, XCircle, Clock } from 'lucide-react';

const EngineerMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    project_id: '',
    name: '',
    quantity: '',
    required_date: '',
  });

  useEffect(() => {
    fetchMaterials();
    fetchProjects();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await apiClient.get('/materials');
      setMaterials(response.data);
    } catch (error) {
      toast.error('Failed to fetch materials');
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
      await apiClient.post('/materials/request', formData);
      toast.success('Material request submitted successfully!');
      setOpen(false);
      setFormData({ project_id: '', name: '', quantity: '', required_date: '' });
      fetchMaterials();
    } catch (error) {
      toast.error('Failed to submit request');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-orange-600" />;
    }
  };

  return (
    <div className="space-y-6" data-testid="engineer-materials-page">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-900">Material Requests</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="request-material-button" className="bg-slate-900 text-white hover:bg-slate-800 rounded-sm btn-press">
              <Plus className="w-4 h-4 mr-2" />
              Request Material
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase tracking-tight">Request Material</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-xs font-medium uppercase tracking-wider">Project</Label>
                <select
                  required
                  data-testid="material-project-select"
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
                <Label className="text-xs font-medium uppercase tracking-wider">Material Name</Label>
                <Input
                  required
                  data-testid="material-name-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Cement, Steel, Equipment"
                  className="mt-1 rounded-sm border-slate-300 bg-slate-50"
                />
              </div>
              <div>
                <Label className="text-xs font-medium uppercase tracking-wider">Quantity</Label>
                <Input
                  required
                  data-testid="material-quantity-input"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="e.g., 100 bags, 5 tons"
                  className="mt-1 rounded-sm border-slate-300 bg-slate-50"
                />
              </div>
              <div>
                <Label className="text-xs font-medium uppercase tracking-wider">Required By</Label>
                <Input
                  type="date"
                  required
                  data-testid="material-date-input"
                  value={formData.required_date}
                  onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
                  className="mt-1 rounded-sm border-slate-300 bg-slate-50"
                />
              </div>
              <Button type="submit" data-testid="submit-material-button" className="w-full bg-slate-900 rounded-sm btn-press">
                Submit Request
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material) => (
          <Card key={material.material_id} className="border-slate-200 rounded-md technical-shadow" data-testid="material-card">
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-slate-400" />
                  <CardTitle className="text-sm font-semibold text-slate-900">
                    {material.name}
                  </CardTitle>
                </div>
                {getStatusIcon(material.status)}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Quantity</p>
                <p className="text-sm text-slate-900">{material.quantity}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Required By</p>
                <p className="text-sm text-slate-900">
                  {new Date(material.required_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Status</p>
                <span
                  className={`inline-block mt-1 text-xs font-medium px-2 py-1 rounded-sm ${
                    material.status === 'Approved'
                      ? 'bg-green-100 text-green-700'
                      : material.status === 'Rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {material.status}
                </span>
              </div>
              {material.admin_comments && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Admin Comments</p>
                  <p className="text-sm text-slate-600 mt-1 p-2 bg-slate-50 rounded-sm border border-slate-200">
                    {material.admin_comments}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {materials.length === 0 && (
        <p className="text-center text-slate-500 py-8">No material requests yet</p>
      )}
    </div>
  );
};

export default EngineerMaterials;
