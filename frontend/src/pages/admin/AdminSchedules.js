import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api";
import { useParams } from "react-router-dom";

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

import { Progress } from "../../components/ui/progress";

import { toast } from "sonner";

import { Plus, Calendar, Trash2 } from "lucide-react";

const AdminSchedules = () => {
  const { projectId } = useParams();

  const [schedules, setSchedules] = useState([]);
  const [holidayList, setHolidayList] = useState([]);

  const [open, setOpen] = useState(false);
  const [holidayOpen, setHolidayOpen] = useState(false);

  const [holidayDate, setHolidayDate] = useState("");

  // ✅ Previous phase selection
  const [selectedPhase, setSelectedPhase] = useState("");

  const [formData, setFormData] = useState({
    phase_name: "",
    duration: "",
    start_date: "",
  });

  // ✅ Load Data
  useEffect(() => {
    fetchSchedules();
    fetchHolidays();
  }, []);

  // ✅ Fetch schedules
  const fetchSchedules = async () => {
    try {
      const res = await apiClient.get(`/projects/${projectId}/schedules`);
      setSchedules(res.data);
    } catch {
      toast.error("Failed to fetch schedules ❌");
    }
  };

  // ✅ Fetch holidays
  const fetchHolidays = async () => {
    try {
      const res = await apiClient.get("/holidays");
      setHolidayList(res.data);
    } catch {
      toast.error("Failed to fetch holidays ❌");
    }
  };

  // ✅ Create Phase
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let startDateToSend = formData.start_date;

      // ✅ If phase exists → auto start date from selected previous phase
      if (schedules.length > 0 && selectedPhase) {
        const prev = schedules.find((p) => p.schedule_id === selectedPhase);

        if (prev) {
          const prevEnd = new Date(prev.end_date);
          prevEnd.setDate(prevEnd.getDate() + 1);

          startDateToSend = prevEnd.toISOString().split("T")[0];
        }
      }

      await apiClient.post("/schedules", {
        project_id: projectId,
        phase_name: formData.phase_name,
        duration: Number(formData.duration),
        start_date: startDateToSend,
      });

      toast.success("Phase Created ✅");

      setOpen(false);
      setSelectedPhase("");

      setFormData({
        phase_name: "",
        duration: "",
        start_date: "",
      });

      fetchSchedules();
    } catch {
      toast.error("Failed to create phase ❌");
    }
  };

  // ✅ Add Holiday
  const handleAddHoliday = async () => {
    if (!holidayDate) return toast.error("Select holiday date ❌");

    try {
      await apiClient.post("/holidays", {
        name: "Holiday",
        date: holidayDate,
      });

      toast.success("Holiday Added ✅");
      setHolidayOpen(false);
      setHolidayDate("");
      fetchHolidays();
    } catch {
      toast.error("Failed to add holiday ❌");
    }
  };

  // ✅ Delete Holiday
  const handleDeleteHoliday = async (id) => {
    try {
      await apiClient.delete(`/holidays/${id}`);
      toast.success("Holiday Removed ✅");
      fetchHolidays();
    } catch {
      toast.error("Failed to remove holiday ❌");
    }
  };

  return (
    <div className="space-y-6">
      {/* ✅ Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
          Project Scheduling
        </h2>

        <div className="flex gap-2">
          {/* ✅ Holiday Button */}
          <Button variant="outline" onClick={() => setHolidayOpen(true)}>
            Manage Holidays
          </Button>

          {/* ✅ Add Phase Modal */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Phase</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Phase Name */}
                <div>
                  <Label>Phase Name</Label>
                  <Input
                    required
                    value={formData.phase_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phase_name: e.target.value,
                      })
                    }
                  />
                </div>

                {/* ✅ Start Date Logic */}
                {schedules.length === 0 ? (
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          start_date: e.target.value,
                        })
                      }
                    />
                  </div>
                ) : (
                  <div>
                    <Label>Select Previous Phase</Label>
                    <select
                      required
                      value={selectedPhase}
                      onChange={(e) => setSelectedPhase(e.target.value)}
                      className="w-full border p-2 rounded-md">
                      <option value="">Select Phase</option>
                      {schedules.map((p) => (
                        <option key={p.schedule_id} value={p.schedule_id}>
                          {p.phase_name} (Ends: {p.end_date})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Duration */}
                <div>
                  <Label>Duration (Working Days)</Label>
                  <Input
                    type="number"
                    required
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: e.target.value,
                      })
                    }
                  />
                </div>

                <Button className="w-full bg-slate-900 text-white">
                  Create Phase ✅
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ✅ Holiday Modal */}
      <Dialog open={holidayOpen} onOpenChange={setHolidayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Project Holidays</DialogTitle>
          </DialogHeader>

          <Input
            type="date"
            value={holidayDate}
            onChange={(e) => setHolidayDate(e.target.value)}
          />

          <Button onClick={handleAddHoliday}>Add Holiday ✅</Button>

          {/* Holiday List */}
          <div className="mt-4 space-y-2">
            {holidayList.length === 0 ? (
              <p className="text-gray-500 text-sm">No holidays added yet.</p>
            ) : (
              holidayList.map((h) => (
                <div
                  key={h.holiday_id}
                  className="flex justify-between items-center border p-2 rounded-md">
                  ✅ {h.date}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteHoliday(h.holiday_id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Schedule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.map((phase) => (
          <Card
            key={phase.schedule_id}
            className="border-slate-200 rounded-md technical-shadow">
            {/* Header */}
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-lg font-semibold uppercase tracking-tight">
                {phase.phase_name}
              </CardTitle>

              {/* ✅ Progress */}
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-600 font-medium">Progress</span>
                  <span className="font-semibold text-orange-600">
                    {phase.progress || 0}%
                  </span>
                </div>

                <Progress value={phase.progress || 0} className="h-2" />
              </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="p-4 space-y-3">
              {/* Dates */}
              <div className="flex items-center text-sm text-slate-600">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                {phase.start_date} → {phase.end_date}
              </div>

              {/* Status Badge */}
              <span
                className={`inline-block text-xs font-medium px-2 py-1 rounded-sm ${
                  phase.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : phase.status === "Ongoing"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-slate-200 text-slate-700"
                }`}>
                {phase.status}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ No Phases */}
      {schedules.length === 0 && (
        <p className="text-center text-gray-500">No phases created yet.</p>
      )}
    </div>
  );
};

export default AdminSchedules;
