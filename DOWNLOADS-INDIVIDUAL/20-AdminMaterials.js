import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { Package, CheckCircle, XCircle, Clock } from 'lucide-react';

const AdminMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState({ status: 'Approved', comments: '' });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await apiClient.get('/materials');
      setMaterials(response.data);
    } catch (error) {
      toast.error('Failed to fetch materials');
    }
  };

  const handleApprove = async () => {
    try {
      await apiClient.post(`/materials/${selectedMaterial.material_id}/approve`, action);
      toast.success(`Material request ${action.status.toLowerCase()} successfully!`);
      setOpen(false);
      setAction({ status: 'Approved', comments: '' });
      fetchMaterials();
    } catch (error) {
      toast.error('Failed to update material');
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
    <div className="space-y-6" data-testid="admin-materials-page">
      <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-900">Material Requests</h3>

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
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Engineer</p>
                <p className="text-sm text-slate-900">{material.engineer_name}</p>
              </div>
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
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Comments</p>
                  <p className="text-sm text-slate-600 mt-1">{material.admin_comments}</p>
                </div>
              )}
              {material.status === 'Pending' && (
                <div className="pt-3 border-t border-slate-200">
                  <Button
                    size="sm"
                    data-testid="review-material-button"
                    onClick={() => {
                      setSelectedMaterial(material);
                      setOpen(true);
                    }}
                    className="w-full bg-slate-900 text-white rounded-sm text-xs btn-press"
                  >
                    Review Request
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase tracking-tight">
              Review Material: {selectedMaterial?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Decision</p>
              <Select value={action.status} onValueChange={(value) => setAction({ ...action, status: value })}>
                <SelectTrigger data-testid="material-status-select" className="rounded-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved">Approve</SelectItem>
                  <SelectItem value="Rejected">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Comments</p>
              <Textarea
                data-testid="material-comments-textarea"
                value={action.comments}
                onChange={(e) => setAction({ ...action, comments: e.target.value })}
                placeholder="Add your comments here..."
                className="rounded-sm border-slate-300 bg-slate-50"
                rows={4}
              />
            </div>
            <Button onClick={handleApprove} data-testid="submit-material-review-button" className="w-full bg-slate-900 rounded-sm btn-press">
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMaterials;
