import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api";

import { Button } from "../../components/ui/button";
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

import { toast } from "sonner";

import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
} from "lucide-react";

import { useParams } from "react-router-dom";

const EngineerDrawings = () => {
  const { projectId } = useParams();

  const [drawings, setDrawings] = useState([]);

  const [open, setOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ✅ Load drawings whenever project changes
  useEffect(() => {
    fetchDrawings();
  }, [projectId]);

  // ✅ Fetch drawings ONLY for this project
  const fetchDrawings = async () => {
    try {
      const res = await apiClient.get(`/drawings?project_id=${projectId}`);

      setDrawings(res.data);
    } catch {
      toast.error("Drawings load nahi ho paaye ❌");
    }
  };

  // ✅ Upload Drawing in SAME project
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("File select karo pehle ❌");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("project_id", projectId); // ✅ Direct project attach
    formData.append("file", selectedFile);

    try {
      await apiClient.post("/drawings/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Drawing upload ho gayi ✅");

      setOpen(false);
      setSelectedFile(null);

      fetchDrawings();
    } catch {
      toast.error("Upload fail ho gaya ❌");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Download Drawing
  const downloadDrawing = async (id, filename) => {
    try {
      const res = await apiClient.get(`/drawings/${id}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);

      link.click();
      link.remove();
    } catch {
      toast.error("Download nahi hua ❌");
    }
  };

  // ✅ Status Icon Logic
  const getStatusIcon = (status) => {
    if (status === "Approved")
      return <CheckCircle className="text-green-600 w-5 h-5" />;

    if (status === "Rejected")
      return <XCircle className="text-red-600 w-5 h-5" />;

    return <Clock className="text-orange-600 w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* ✅ Page Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
          Project Drawings
        </h2>

        {/* ✅ Upload Drawing Button */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 text-white">
              <Upload className="w-4 h-4 mr-2" />
              Upload Drawing
            </Button>
          </DialogTrigger>

          {/* ✅ Upload Modal */}
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase tracking-tight">
                Upload New Drawing
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium uppercase tracking-wider">
                  Select File (PDF/JPG)
                </Label>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="mt-2 w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-sm file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                />

                {selectedFile && (
                  <p className="text-xs text-slate-500 mt-2">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-slate-900 text-white">
                {uploading ? "Uploading..." : "Upload ✅"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ✅ Drawing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drawings.map((d) => (
          <Card
            key={d.drawing_id}
            className="border-slate-200 rounded-md technical-shadow">
            {/* ✅ Card Header */}
            <CardHeader className="border-b border-slate-200">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-slate-400" />

                  <CardTitle className="text-sm font-semibold text-slate-900">
                    {d.filename}
                  </CardTitle>
                </div>

                {getStatusIcon(d.status)}
              </div>
            </CardHeader>

            {/* ✅ Card Content */}
            <CardContent className="p-4 space-y-3">
              {/* Upload Date */}
              <p className="text-xs text-slate-600">
                Uploaded: {new Date(d.upload_date).toLocaleString()}
              </p>

              {/* Status Badge */}
              <span
                className={`inline-block text-xs font-medium px-2 py-1 rounded-sm ${
                  d.status === "Approved"
                    ? "bg-green-100 text-green-700"
                    : d.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-orange-100 text-orange-700"
                }`}>
                {d.status}
              </span>

              {/* ✅ Download Button */}
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => downloadDrawing(d.drawing_id, d.filename)}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ Empty State */}
      {drawings.length === 0 && (
        <p className="text-center text-slate-500 py-8">
          Abhi tak koi drawing upload nahi hui ❌
        </p>
      )}
    </div>
  );
};

export default EngineerDrawings;
