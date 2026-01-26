import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Progress } from "../../components/ui/progress";
import { toast } from "sonner";
import { MapPin, Calendar, DollarSign } from "lucide-react";

const EngineerProjects = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [open, setOpen] = useState(false);
  const [progressData, setProgressData] = useState({ progress: 0, notes: "" });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await apiClient.get("/projects");
      setProjects(response.data);
    } catch (error) {
      toast.error("Failed to fetch projects");
    }
  };

  const handleUpdateProgress = async () => {
    try {
      await apiClient.post(`/projects/${selectedProject.project_id}/progress`, {
        project_id: selectedProject.project_id,
        ...progressData,
      });
      toast.success("Progress updated successfully!");
      setOpen(false);
      setProgressData({ progress: 0, notes: "" });
      fetchProjects();
    } catch (error) {
      toast.error("Failed to update progress");
    }
  };

  return (
    <div className="space-y-6" data-testid="engineer-projects-page">
      <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
        My Projects
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card
            key={project.project_id}
            className="border-slate-200 rounded-md technical-shadow"
            data-testid="project-card">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-lg font-semibold uppercase tracking-tight text-slate-900">
                {project.name}
              </CardTitle>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-600 font-medium">Progress</span>
                  <span className="font-semibold text-orange-600">
                    {project.progress}%
                  </span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
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
                <span className="font-semibold">
                  ${project.budget.toLocaleString()}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <span
                  className={`inline-block text-xs font-medium px-2 py-1 rounded-sm ${
                    project.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : project.status === "In Progress"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-slate-200 text-slate-700"
                  }`}>
                  {project.status}
                </span>
                <Button
                  size="sm"
                  data-testid="update-progress-button"
                  onClick={() => {
                    setSelectedProject(project);
                    setProgressData({ progress: project.progress, notes: "" });
                    setOpen(true);
                  }}
                  className="w-full mt-3 bg-slate-900 text-white rounded-sm text-xs btn-press">
                  Update Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase tracking-tight">
              Update Progress: {selectedProject?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider">
                Progress (%)
              </Label>
              <Input
                type="number"
                min="0"
                max="100"
                data-testid="progress-input"
                value={progressData.progress}
                onChange={(e) =>
                  setProgressData({
                    ...progressData,
                    progress: parseFloat(e.target.value),
                  })
                }
                className="mt-1 rounded-sm border-slate-300 bg-slate-50"
              />
            </div>
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider">
                Notes
              </Label>
              <Textarea
                data-testid="progress-notes-textarea"
                value={progressData.notes}
                onChange={(e) =>
                  setProgressData({ ...progressData, notes: e.target.value })
                }
                placeholder="Add progress notes..."
                className="mt-1 rounded-sm border-slate-300 bg-slate-50"
                rows={4}
              />
            </div>
            <Button
              onClick={handleUpdateProgress}
              data-testid="submit-progress-button"
              className="w-full bg-slate-900 rounded-sm btn-press">
              Update Progress
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EngineerProjects;
