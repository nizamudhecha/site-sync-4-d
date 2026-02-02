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
} from "../../components/ui/dialog";

import { Progress } from "../../components/ui/progress";

import { toast } from "sonner";

import { Calendar, Pencil } from "lucide-react";

const EngineerSchedules = () => {
  const { projectId } = useParams();

  const [schedules, setSchedules] = useState([]);

  const [open, setOpen] = useState(false);

  const [selectedPhase, setSelectedPhase] = useState(null);

  const [progressValue, setProgressValue] = useState(0);

  // ✅ Fetch All Phases
  useEffect(() => {
    fetchSchedules();
  }, []);

  // ✅ Get schedules from backend
  const fetchSchedules = async () => {
    try {
      const res = await apiClient.get(`/projects/${projectId}/schedules`);

      setSchedules(res.data);
    } catch {
      toast.error("Failed to fetch schedule ❌");
    }
  };

  // ✅ Open Progress Modal
  const handleOpenProgress = (phase) => {
    setSelectedPhase(phase);
    setProgressValue(phase.progress || 0);
    setOpen(true);
  };

  // ✅ Update Progress API Call
  const handleUpdateProgress = async () => {
    try {
      await apiClient.put(
        `/schedules/${selectedPhase.schedule_id}/progress?progress=${progressValue}`,
      );

      toast.success("Progress Updated ✅");
      setOpen(false);

      fetchSchedules();
    } catch {
      toast.error("Failed to update progress ❌");
    }
  };

  return (
    <div className="space-y-6">
      {/* ✅ Page Title */}
      <h2 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
        Project Schedule Phases
      </h2>

      {/* ✅ Schedule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.map((phase) => (
          <Card
            key={phase.schedule_id}
            className="border-slate-200 rounded-md technical-shadow">
            {/* Header */}
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-lg font-semibold uppercase tracking-tight text-slate-900">
                {phase.phase_name}
              </CardTitle>

              {/* ✅ Progress Bar */}
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

              {/* ✅ Update Progress Button */}
              <Button
                onClick={() => handleOpenProgress(phase)}
                className="w-full bg-slate-900 text-white text-xs">
                <Pencil className="w-4 h-4 mr-2" />
                Update Phase Progress
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ No Phases */}
      {schedules.length === 0 && (
        <p className="text-center text-gray-500">
          No schedule phases created yet.
        </p>
      )}

      {/* ✅ Modal for Updating Progress */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Update Progress: {selectedPhase?.phase_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Input */}
            <div>
              <Label>Progress (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={progressValue}
                onChange={(e) => setProgressValue(e.target.value)}
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleUpdateProgress}
              className="w-full bg-slate-900 text-white">
              Save Progress ✅
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EngineerSchedules;
