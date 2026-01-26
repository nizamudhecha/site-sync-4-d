import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { MapPin, Calendar, DollarSign, FileText, Download } from "lucide-react";
import { toast } from "sonner";

const ClientProjects = () => {
  const [projects, setProjects] = useState([]);
  const [drawings, setDrawings] = useState({});
  const [schedules, setSchedules] = useState({});

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await apiClient.get("/projects");
      setProjects(response.data);
      response.data.forEach((project) => {
        fetchProjectDrawings(project.project_id);
        fetchProjectSchedules(project.project_id);
      });
    } catch (error) {
      toast.error("Failed to fetch projects");
    }
  };

  const fetchProjectDrawings = async (projectId) => {
    try {
      const response = await apiClient.get(`/drawings?project_id=${projectId}`);
      const approved = response.data.filter((d) => d.status === "Approved");
      setDrawings((prev) => ({ ...prev, [projectId]: approved }));
    } catch (error) {
      console.error("Failed to fetch drawings:", error);
    }
  };

  const fetchProjectSchedules = async (projectId) => {
    try {
      const response = await apiClient.get(
        `/schedules?project_id=${projectId}`,
      );
      setSchedules((prev) => ({ ...prev, [projectId]: response.data }));
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    }
  };

  const downloadDrawing = async (drawingId, filename) => {
    try {
      const response = await apiClient.get(`/drawings/${drawingId}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Failed to download drawing");
    }
  };

  return (
    <div className="space-y-6" data-testid="client-projects-page">
      <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
        Project Details
      </h3>

      {projects.map((project) => (
        <Card
          key={project.project_id}
          className="border-slate-200 rounded-md technical-shadow"
          data-testid="project-detail-card">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl font-bold uppercase tracking-tight text-slate-900">
                  {project.name}
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  {project.location}
                </p>
              </div>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-sm ${
                  project.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : project.status === "In Progress"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-slate-200 text-slate-700"
                }`}>
                {project.status}
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-600 font-medium">
                  Overall Progress
                </span>
                <span className="font-semibold text-orange-600">
                  {project.progress}%
                </span>
              </div>
              <Progress value={project.progress} className="h-3" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="drawings">Drawings</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-sm border border-slate-200">
                    <div className="flex items-center text-slate-600 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        Location
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {project.location}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-sm border border-slate-200">
                    <div className="flex items-center text-slate-600 mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        Timeline
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {new Date(project.start_date).toLocaleDateString()} -{" "}
                      {new Date(project.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-sm border border-slate-200">
                    <div className="flex items-center text-slate-600 mb-2">
                      <span className="text-lg font-bold mr-2">₹</span>
                      <span className="text-xs font-medium uppercase tracking-wider">
                        Budget
                      </span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      ${project.budget.toLocaleString()}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="drawings" className="space-y-3">
                {drawings[project.project_id]?.length > 0 ? (
                  drawings[project.project_id].map((drawing) => (
                    <div
                      key={drawing.drawing_id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-sm border border-slate-200"
                      data-testid="approved-drawing-item">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {drawing.filename}
                          </p>
                          <p className="text-xs text-slate-600">
                            Uploaded:{" "}
                            {new Date(drawing.upload_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        data-testid="download-drawing-button"
                        onClick={() =>
                          downloadDrawing(drawing.drawing_id, drawing.filename)
                        }
                        className="bg-slate-900 text-white rounded-sm text-xs btn-press">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-8">
                    No approved drawings yet
                  </p>
                )}
              </TabsContent>

              <TabsContent value="schedule" className="space-y-3">
                {schedules[project.project_id]?.length > 0 ? (
                  schedules[project.project_id].map((schedule) => (
                    <div
                      key={schedule.schedule_id}
                      className="p-4 bg-slate-50 rounded-sm border border-slate-200"
                      data-testid="schedule-item">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm text-slate-900">
                            {schedule.phase_name}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            {new Date(schedule.start_date).toLocaleDateString()}{" "}
                            - {new Date(schedule.end_date).toLocaleDateString()}
                          </p>
                          {schedule.description && (
                            <p className="text-xs text-slate-500 mt-2">
                              {schedule.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-8">
                    No schedules available
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClientProjects;
