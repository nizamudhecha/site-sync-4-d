import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api";

import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";

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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

import { toast } from "sonner";

import { FileText, Download, CheckCircle, XCircle, Clock } from "lucide-react";

import { useParams } from "react-router-dom";

const AdminDrawings = () => {
  const { projectId } = useParams(); // ✅ Project Id from URL

  const [drawings, setDrawings] = useState([]);
  const [selectedDrawing, setSelectedDrawing] = useState(null);

  const [open, setOpen] = useState(false);

  const [action, setAction] = useState({
    status: "Approved",
    comments: "",
  });

  useEffect(() => {
    fetchDrawings();
  }, [projectId]);

  // ✅ Fetch Drawings Project Wise
  const fetchDrawings = async () => {
    try {
      const response = await apiClient.get(`/drawings?project_id=${projectId}`);

      setDrawings(response.data);
    } catch {
      toast.error("Failed to fetch drawings ❌");
    }
  };

  // ✅ Review Submit
  const handleApprove = async () => {
    if (!selectedDrawing) return;

    try {
      await apiClient.post(
        `/drawings/${selectedDrawing.drawing_id}/approve`,
        action,
      );

      toast.success(`Drawing ${action.status} ✅`);

      setOpen(false);
      setSelectedDrawing(null);

      setAction({
        status: "Approved",
        comments: "",
      });

      fetchDrawings();
    } catch {
      toast.error("Failed to update drawing ❌");
    }
  };

  // ✅ Download Drawing
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
    } catch {
      toast.error("Download failed ❌");
    }
  };

  // ✅ Status Icon
  const getStatusIcon = (status) => {
    if (status === "Approved")
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === "Rejected")
      return <XCircle className="w-5 h-5 text-red-600" />;

    return <Clock className="w-5 h-5 text-orange-600" />;
  };

  return (
    <div className="space-y-6" data-testid="admin-drawings-page">
      {/* ✅ Title */}
      <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
        Drawing Approvals
      </h3>

      {/* ✅ Drawing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drawings.map((drawing) => (
          <Card
            key={drawing.drawing_id}
            className="border-slate-200 rounded-md technical-shadow">
            {/* ✅ Header */}
            <CardHeader className="border-b border-slate-200">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <CardTitle className="text-sm font-semibold text-slate-900">
                    {drawing.filename}
                  </CardTitle>
                </div>

                {getStatusIcon(drawing.status)}
              </div>
            </CardHeader>

            {/* ✅ Content */}
            <CardContent className="p-4 space-y-3">
              {/* Engineer Name */}
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Engineer
                </p>
                <p className="text-sm text-slate-900">
                  {drawing.engineer_name || "N/A"}
                </p>
              </div>

              {/* Upload Date */}
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Upload Date
                </p>
                <p className="text-sm text-slate-900">
                  {new Date(drawing.upload_date).toLocaleString()}
                </p>
              </div>

              {/* Status Badge */}
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Status
                </p>

                <span
                  className={`inline-block mt-1 text-xs font-medium px-2 py-1 rounded-sm ${
                    drawing.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : drawing.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                  }`}>
                  {drawing.status}
                </span>
              </div>

              {/* Admin Comments */}
              {drawing.admin_comments && (
                <div>
                  <p className="text-xs font-medium uppercase text-slate-500">
                    Comments
                  </p>
                  <p className="text-sm text-slate-600">
                    {drawing.admin_comments}
                  </p>
                </div>
              )}

              {/* ✅ Buttons */}
              <div className="pt-3 border-t flex gap-2">
                {/* Download */}
                <Button
                  size="sm"
                  className="flex-1 bg-white border border-slate-300 text-slate-900 hover:bg-slate-50"
                  onClick={() =>
                    downloadDrawing(drawing.drawing_id, drawing.filename)
                  }>
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>

                {/* Review Button Only Pending */}
                {drawing.status === "Pending" && (
                  <Button
                    size="sm"
                    className="flex-1 bg-slate-900 text-white"
                    onClick={() => {
                      setSelectedDrawing(drawing);
                      setOpen(true);
                    }}>
                    Review
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ Empty */}
      {drawings.length === 0 && (
        <p className="text-center text-slate-500">No drawings uploaded yet.</p>
      )}

      {/* ✅ Review Modal */}
      {selectedDrawing && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Review Drawing: {selectedDrawing.filename}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Decision */}
              <div>
                <p className="text-xs font-medium uppercase text-slate-500 mb-2">
                  Decision
                </p>

                <Select
                  value={action.status}
                  onValueChange={(value) =>
                    setAction({ ...action, status: value })
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Approved">Approve</SelectItem>
                    <SelectItem value="Rejected">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Comments */}
              <div>
                <p className="text-xs font-medium uppercase text-slate-500 mb-2">
                  Comments
                </p>

                <Textarea
                  value={action.comments}
                  onChange={(e) =>
                    setAction({
                      ...action,
                      comments: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Add comment..."
                />
              </div>

              {/* Submit */}
              <Button
                onClick={handleApprove}
                className="w-full bg-slate-900 text-white">
                Submit Review ✅
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminDrawings;
