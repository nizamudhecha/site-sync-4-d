import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

import { Progress } from "../../components/ui/progress";

import { toast } from "sonner";

import { Plus, MapPin, Calendar, IndianRupee, Trash2 } from "lucide-react";

import { useNavigate } from "react-router-dom";

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [clients, setClients] = useState([]);

  const [open, setOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedEngineers, setSelectedEngineers] = useState([]);

  const navigate = useNavigate();

  // ✅ FULL FORM DATA
  const [formData, setFormData] = useState({
    name: "",
    client_email: "",
    location: "",
    start_date: "",
    end_date: "",
    budget: "",
  });

  // ✅ Load All Data
  useEffect(() => {
    fetchProjects();
    fetchEngineers();
    fetchClients();
  }, []);

  // ✅ Fetch Projects
  const fetchProjects = async () => {
    try {
      const res = await apiClient.get("/projects");
      setProjects(res.data);
    } catch {
      toast.error("Failed to fetch projects ❌");
    }
  };

  // ✅ Engineers
  const fetchEngineers = async () => {
    const res = await apiClient.get("/users?role=Engineer");
    setEngineers(res.data);
  };

  // ✅ Clients
  const fetchClients = async () => {
    const res = await apiClient.get("/users?role=Client");
    setClients(res.data);
  };

  // ✅ Create Project
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await apiClient.post("/projects", {
        ...formData,
        budget: parseFloat(formData.budget),
      });

      toast.success("Project Created ✅");

      setOpen(false);

      // ✅ Reset Form
      setFormData({
        name: "",
        client_email: "",
        location: "",
        start_date: "",
        end_date: "",
        budget: "",
      });

      fetchProjects();
    } catch {
      toast.error("Failed to create project ❌");
    }
  };

  // ✅ Assign Engineers
  const handleAssignEngineers = async () => {
    await apiClient.post(
      `/projects/${selectedProject.project_id}/assign`,
      selectedEngineers,
    );

    toast.success("Engineers Assigned ✅");
    setAssignOpen(false);
    fetchProjects();
  };

  // ✅ Toggle Engineer
  const toggleEngineerSelection = (id) => {
    setSelectedEngineers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // ✅ Delete Project
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Delete this project? ❌")) return;

    await apiClient.delete(`/projects/${projectId}`);
    toast.success("Project Deleted ✅");
    fetchProjects();
  };

  return (
    <div className="space-y-6">
      {/* ✅ Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold uppercase tracking-tight">
          All Projects
        </h2>

        {/* ✅ Create Project Modal */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </DialogTrigger>

          {/* ✅ Modal Content */}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ✅ Project Name */}
              <div>
                <Label>Project Name</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              {/* ✅ Client */}
              <div>
                <Label>Select Client</Label>
                <Select
                  value={formData.client_email}
                  onValueChange={(value) =>
                    setFormData({ ...formData, client_email: value })
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Client" />
                  </SelectTrigger>

                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.user_id} value={c.email}>
                        {c.name} ({c.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ✅ Location */}
              <div>
                <Label>Location</Label>
                <Input
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>

              {/* ✅ Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* ✅ Budget */}
              <div>
                <Label>Budget (₹)</Label>
                <Input
                  type="number"
                  required
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                />
              </div>

              {/* ✅ Submit */}
              <Button type="submit" className="w-full bg-black text-white">
                Create Project ✅
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ✅ Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.project_id} className="relative">
            {/* ✅ Delete */}
            <button
              onClick={() => handleDeleteProject(project.project_id)}
              className="absolute top-3 right-3 text-red-600">
              <Trash2 className="w-5 h-5" />
            </button>

            {/* ✅ Header */}
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>

              {/* ✅ Progress */}
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span className="font-bold text-orange-600">
                    {project.progress || 0}%
                  </span>
                </div>

                <Progress value={project.progress || 0} className="h-2" />
              </div>

              <p className="text-sm mt-2 text-slate-600">
                Client:{" "}
                <span className="font-semibold text-orange-600">
                  {project.client_name}
                </span>
              </p>
            </CardHeader>

            {/* ✅ Content */}
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-2" />
                {project.location}
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                {project.start_date} → {project.end_date}
              </div>

              <div className="flex items-center text-sm">
                <IndianRupee className="w-4 h-4 mr-2" />₹{" "}
                {project.budget?.toLocaleString()}
              </div>

              {/* ✅ Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                <Button
                  onClick={() => {
                    setSelectedProject(project);
                    setSelectedEngineers(project.assigned_engineers);
                    setAssignOpen(true);
                  }}>
                  Engineers
                </Button>

                <Button
                  onClick={() =>
                    navigate(`/admin/schedule/${project.project_id}`)
                  }>
                  Schedule
                </Button>

                <Button
                  onClick={() =>
                    navigate(`/admin/drawings/${project.project_id}`)
                  }>
                  Drawings
                </Button>

                <Button
                  onClick={() =>
                    navigate(`/admin/materials/${project.project_id}`)
                  }>
                  Materials
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ Assign Engineers Modal */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign Engineers to {selectedProject?.name}
            </DialogTitle>
          </DialogHeader>

          {engineers.map((eng) => (
            <div key={eng.user_id} className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={selectedEngineers.includes(eng.user_id)}
                onChange={() => toggleEngineerSelection(eng.user_id)}
              />
              {eng.name}
            </div>
          ))}

          <Button onClick={handleAssignEngineers} className="w-full bg-black">
            Confirm Assign ✅
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProjects;
