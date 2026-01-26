import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle, XCircle, Clock, Download } from 'lucide-react';

const EngineerDrawings = () => {
  const [drawings, setDrawings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDrawings();
    fetchProjects();
  }, []);

  const fetchDrawings = async () => {
    try {
      const response = await apiClient.get('/drawings');
      setDrawings(response.data);
    } catch (error) {
      toast.error('Failed to fetch drawings');
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

  const handleUpload = async () => {
    if (!selectedProject || !selectedFile) {
      toast.error('Please select a project and file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('project_id', selectedProject);
    formData.append('file', selectedFile);

    try {
      await apiClient.post('/drawings/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Drawing uploaded successfully!');
      setOpen(false);
      setSelectedProject('');
      setSelectedFile(null);
      fetchDrawings();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload drawing');
    } finally {
      setUploading(false);
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
    <div className="space-y-6" data-testid="engineer-drawings-page">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-900">My Drawings</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="upload-drawing-button" className="bg-slate-900 text-white hover:bg-slate-800 rounded-sm btn-press">
              <Upload className="w-4 h-4 mr-2" />
              Upload Drawing
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase tracking-tight">Upload Drawing</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium uppercase tracking-wider">Project</Label>
                <select
                  data-testid="drawing-project-select"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
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
                <Label className="text-xs font-medium uppercase tracking-wider">File (PDF or JPG)</Label>
                <input
                  type="file"
                  data-testid="drawing-file-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="mt-1 w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                />
                {selectedFile && (
                  <p className="text-xs text-slate-600 mt-2">{selectedFile.name}</p>
                )}
              </div>
              <Button
                onClick={handleUpload}
                data-testid="submit-drawing-button"
                disabled={uploading}
                className="w-full bg-slate-900 rounded-sm btn-press"
              >
                {uploading ? 'Uploading...' : 'Upload Drawing'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Admin Comments</p>
                  <p className="text-sm text-slate-600 mt-1 p-2 bg-slate-50 rounded-sm border border-slate-200">
                    {drawing.admin_comments}
                  </p>
                </div>
              )}
              <div className="pt-3 border-t border-slate-200">
                <Button
                  size="sm"
                  data-testid="download-drawing-button"
                  onClick={() => downloadDrawing(drawing.drawing_id, drawing.filename)}
                  className="w-full bg-white border border-slate-300 text-slate-900 hover:bg-slate-50 rounded-sm text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {drawings.length === 0 && (
        <p className="text-center text-slate-500 py-8">No drawings uploaded yet</p>
      )}
    </div>
  );
};

export default EngineerDrawings;
