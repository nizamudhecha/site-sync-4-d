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

import { toast } from "sonner";

import {
  Plus,
  MapPin,
  DollarSign,
  Calendar,
  Users as UsersIcon,
} from "lucide-react";

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [clients, setClients] = useState([]);

  const [open, setOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedEngineers, setSelectedEngineers] = useState([]);

  // ✅ FORM DATA (EMAIL BASED)
  const [formData, setFormData] = useState({
    name: "",
    client_email: "", // ✅ email instead of client_id
    location: "",
    start_date: "",
    end_date: "",
    budget: "",
  });

  // ✅ Fetch All Data
  useEffect(() => {
    fetchProjects();
    fetchEngineers();
    fetchClients();
  }, []);

  // ✅ Fetch Projects
  const fetchProjects = async () => {
    try {
      const response = await apiClient.get("/projects");
      setProjects(response.data);
    } catch (error) {
      toast.error("Failed to fetch projects");
    }
  };

  // ✅ Fetch Engineers
  const fetchEngineers = async () => {
    try {
      const response = await apiClient.get("/users?role=Engineer");
      setEngineers(response.data);
    } catch (error) {
      toast.error("Failed to fetch engineers");
    }
  };

  // ✅ Fetch Clients
  const fetchClients = async () => {
    try {
      const response = await apiClient.get("/users?role=Client");
      setClients(response.data);
    } catch (error) {
      toast.error("Failed to fetch clients");
    }
  };

  // ✅ Submit New Project
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.client_email) {
      toast.error("Please select a client");
      return;
    }

    try {
      await apiClient.post("/projects", {
        ...formData,
        budget: parseFloat(formData.budget),
      });

      toast.success("Project created successfully!");
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
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  // ✅ Assign Engineers
  const handleAssignEngineers = async () => {
    if (!selectedProject || selectedEngineers.length === 0) {
      toast.error("Select at least one engineer");
      return;
    }

    try {
      await apiClient.post(
        `/projects/${selectedProject.project_id}/assign`,
        selectedEngineers,
      );

      toast.success("Engineers assigned successfully!");
      setAssignOpen(false);
      setSelectedEngineers([]);

      fetchProjects();
    } catch (error) {
      toast.error("Failed to assign engineers");
    }
  };

  // ✅ Toggle Engineer Checkbox
  const toggleEngineerSelection = (engineerId) => {
    setSelectedEngineers((prev) =>
      prev.includes(engineerId)
        ? prev.filter((id) => id !== engineerId)
        : [...prev, engineerId],
    );
  };

  // ✅ Update Status
  const updateProjectStatus = async (projectId, status) => {
    try {
      await apiClient.put(`/projects/${projectId}`, { status });
      toast.success("Status updated");
      fetchProjects();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">All Projects</h2>

        {/* CREATE PROJECT DIALOG */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Project Name */}
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

              {/* ✅ Client Dropdown (EMAIL) */}
              <div>
                <Label>Select Client</Label>

                <Select
                  value={formData.client_email}
                  onValueChange={(value) =>
                    setFormData({ ...formData, client_email: value })
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose client email" />
                  </SelectTrigger>

                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.user_id} value={client.email}>
                        {client.name} ({client.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
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

              {/* Dates */}
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

              {/* Budget */}
              <div>
                <Label>Budget</Label>
                <Input
                  type="number"
                  required
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                />
              </div>

              <Button type="submit" className="w-full bg-black text-white">
                Create Project
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* PROJECT LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((project) => (
          <Card key={project.project_id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>

              {/* Status */}
              <Select
                value={project.status}
                onValueChange={(value) =>
                  updateProjectStatus(project.project_id, value)
                }>
                <SelectTrigger className="w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>

            <CardContent className="space-y-2 text-sm">
              <p className="flex items-center">
                <UsersIcon className="w-4 h-4 mr-2" />
                Client: {project.client_name}
              </p>

              <p className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {project.location}
              </p>

              <p className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {project.start_date} → {project.end_date}
              </p>

              <p className="flex items-center">
                <span className="text-lg font-bold mr-2">₹</span>₹
                {project.budget.toLocaleString()}
              </p>

              {/* Assign Engineers */}
              <Button
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  setSelectedProject(project);
                  setSelectedEngineers(project.assigned_engineers);
                  setAssignOpen(true);
                }}>
                Manage Engineers
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ASSIGN ENGINEERS DIALOG */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign Engineers to {selectedProject?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 max-h-72 overflow-y-auto">
            {engineers.map((engineer) => (
              <div key={engineer.user_id} className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={selectedEngineers.includes(engineer.user_id)}
                  onChange={() => toggleEngineerSelection(engineer.user_id)}
                />
                <span>
                  {engineer.name} ({engineer.email})
                </span>
              </div>
            ))}
          </div>

          <Button onClick={handleAssignEngineers} className="w-full bg-black">
            Confirm Assign
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProjects;
