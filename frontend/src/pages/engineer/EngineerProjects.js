import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api";
import { Button } from "../../components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

import { Progress } from "../../components/ui/progress";
import { toast } from "sonner";

import { MapPin, Calendar, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EngineerProjects = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  // ✅ Load Projects
  useEffect(() => {
    fetchProjects();
  }, []);

  // ✅ Fetch Projects
  const fetchProjects = async () => {
    try {
      const response = await apiClient.get("/projects");
      setProjects(response.data);
    } catch {
      toast.error("Failed to fetch projects ❌");
    }
  };

  return (
    <div className="space-y-6" data-testid="engineer-projects-page">
      {/* ✅ Title */}
      <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
        My Projects
      </h3>

      {/* ✅ Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card
            key={project.project_id}
            className="border-slate-200 rounded-md technical-shadow"
            data-testid="project-card">
            {/* ✅ Header */}
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-lg font-semibold uppercase tracking-tight text-slate-900">
                {project.name}
              </CardTitle>

              {/* ✅ Progress */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-600 font-medium">Progress</span>

                  <span className="font-semibold text-orange-600">
                    {project.progress || 0}%
                  </span>
                </div>

                <Progress value={project.progress || 0} className="h-2" />
              </div>
            </CardHeader>

            {/* ✅ Content */}
            <CardContent className="p-4 space-y-3">
              {/* Location */}
              <div className="flex items-center text-sm text-slate-600">
                <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                {project.location}
              </div>

              {/* Dates */}
              <div className="flex items-center text-sm text-slate-600">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                {new Date(project.start_date).toLocaleDateString()} -{" "}
                {new Date(project.end_date).toLocaleDateString()}
              </div>

              {/* Budget */}
              <div className="flex items-center text-sm text-slate-600">
                <IndianRupee className="w-4 h-4 mr-2 text-slate-400" />₹{" "}
                {project.budget.toLocaleString()}
              </div>

              {/* ✅ Status */}
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

              {/* ✅ Buttons (2 Per Row like Admin) */}
              <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2">
                {/* ✅ View Schedule */}
                <Button
                  className="w-full bg-slate-900 text-white text-xs"
                  onClick={() =>
                    navigate(`/engineer/schedule/${project.project_id}`)
                  }>
                  Schedule
                </Button>

                {/* ✅ View Drawings */}
                <Button
                  className="w-full bg-slate-900 text-white text-xs"
                  onClick={() =>
                    navigate(`/engineer/drawings/${project.project_id}`)
                  }>
                  Drawings
                </Button>
                <Button
                  className="w-full bg-slate-900 text-white text-xs"
                  onClick={() =>
                    navigate(`/engineer/Materials/${project.project_id}`)
                  }>
                  Materials
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EngineerProjects;
