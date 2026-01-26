import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { FileText, Download, CheckCircle, XCircle, Clock } from 'lucide-react';

const AdminDrawings = () => {
  const [drawings, setDrawings] = useState([]);
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState({ status: 'Approved', comments: '' });

  useEffect(() => {
    fetchDrawings();
  }, []);

  const fetchDrawings = async () => {
    try {
      const response = await apiClient.get('/drawings');
      setDrawings(response.data);
    } catch (error) {
      toast.error('Failed to fetch drawings');
    }
  };

  const handleApprove = async () => {
    try {
      await apiClient.post(`/drawings/${selectedDrawing.drawing_id}/approve`, action);
      toast.success(`Drawing ${action.status.toLowerCase()} successfully!`);
      setOpen(false);
      setAction({ status: 'Approved', comments: '' });
      fetchDrawings();
    } catch (error) {
      toast.error('Failed to update drawing');
    }
  };

  const downloadDrawing = async (drawingId, filename) => {
    try {
      const response = await apiClient.get(`/drawings/${drawingId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download drawing');
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
    <div className="space-y-6" data-testid="admin-drawings-page">
      <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-900">Drawing Approvals</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drawings.map((drawing) => (
          <Card key={drawing.drawing_id} className="border-slate-200 rounded-md technical-shadow" data-testid="drawing-card">
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <CardTitle className="text-sm font-semibold text-slate-900">
                    {drawing.filename}
                  </CardTitle>
                </div>
                {getStatusIcon(drawing.status)}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Engineer</p>
                <p className="text-sm text-slate-900">{drawing.engineer_name}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Upload Date</p>
                <p className="text-sm text-slate-900">
                  {new Date(drawing.upload_date).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Status</p>
                <span
                  className={`inline-block mt-1 text-xs font-medium px-2 py-1 rounded-sm ${
                    drawing.status === 'Approved'
                      ? 'bg-green-100 text-green-700'
                      : drawing.status === 'Rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {drawing.status}
                </span>
              </div>
              {drawing.admin_comments && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Comments</p>
                  <p className="text-sm text-slate-600 mt-1">{drawing.admin_comments}</p>
                </div>
              )}
              <div className="pt-3 border-t border-slate-200 flex space-x-2">
                <Button
                  size="sm"
                  data-testid="download-drawing-button"
                  onClick={() => downloadDrawing(drawing.drawing_id, drawing.filename)}
                  className="flex-1 bg-white border border-slate-300 text-slate-900 hover:bg-slate-50 rounded-sm text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
                {drawing.status === 'Pending' && (
                  <Button
                    size="sm"
                    data-testid="review-drawing-button"
                    onClick={() => {
                      setSelectedDrawing(drawing);
                      setOpen(true);
                    }}
                    className="flex-1 bg-slate-900 text-white rounded-sm text-xs btn-press"
                  >
                    Review
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase tracking-tight">
              Review Drawing: {selectedDrawing?.filename}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Decision</p>
              <Select value={action.status} onValueChange={(value) => setAction({ ...action, status: value })}>
                <SelectTrigger data-testid="drawing-status-select" className="rounded-sm">
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
                data-testid="drawing-comments-textarea"
                value={action.comments}
                onChange={(e) => setAction({ ...action, comments: e.target.value })}
                placeholder="Add your comments here..."
                className="rounded-sm border-slate-300 bg-slate-50"
                rows={4}
              />
            </div>
            <Button onClick={handleApprove} data-testid="submit-review-button" className="w-full bg-slate-900 rounded-sm btn-press">
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDrawings;
