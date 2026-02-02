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

import { Package, CheckCircle, XCircle, Clock } from "lucide-react";

import { useParams } from "react-router-dom";

const AdminMaterials = () => {
  // ✅ ProjectId URL se direct milega
  const { projectId } = useParams();

  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [open, setOpen] = useState(false);

  const [action, setAction] = useState({
    status: "Approved",
    comments: "",
  });

  // ✅ Load Materials Project Wise
  useEffect(() => {
    fetchMaterials();
  }, [projectId]);

  // ✅ Fetch Materials Only for This Project
  const fetchMaterials = async () => {
    try {
      const res = await apiClient.get(`/materials?project_id=${projectId}`);

      setMaterials(res.data);
    } catch {
      toast.error("Failed to fetch materials ❌");
    }
  };

  // ✅ Approve / Reject Request
  const handleApprove = async () => {
    try {
      await apiClient.post(
        `/materials/${selectedMaterial.material_id}/approve`,
        action,
      );

      toast.success(`Material request ${action.status.toLowerCase()} ✅`);

      setOpen(false);

      // ✅ Reset Modal
      setSelectedMaterial(null);
      setAction({ status: "Approved", comments: "" });

      fetchMaterials();
    } catch {
      toast.error("Failed to update material ❌");
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
    <div className="space-y-6">
      {/* ✅ Page Title */}
      <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
        Material Requests (Project Wise)
      </h3>

      {/* ✅ Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material) => (
          <Card
            key={material.material_id}
            className="border-slate-200 rounded-md technical-shadow">
            {/* ✅ Header */}
            <CardHeader className="border-b border-slate-200">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-slate-400" />
                  <CardTitle className="text-sm font-semibold text-slate-900">
                    {material.name}
                  </CardTitle>
                </div>

                {getStatusIcon(material.status)}
              </div>
            </CardHeader>

            {/* ✅ Content */}
            <CardContent className="p-4 space-y-3">
              {/* Engineer */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Engineer
                </p>
                <p className="text-sm text-slate-900">
                  {material.engineer_name}
                </p>
              </div>

              {/* Quantity */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Quantity
                </p>
                <p className="text-sm text-slate-900">{material.quantity}</p>
              </div>

              {/* Required Date */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Required By
                </p>
                <p className="text-sm text-slate-900">
                  {new Date(material.required_date).toLocaleDateString()}
                </p>
              </div>

              {/* Status Badge */}
              <span
                className={`inline-block mt-1 text-xs font-medium px-2 py-1 rounded-sm ${
                  material.status === "Approved"
                    ? "bg-green-100 text-green-700"
                    : material.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-orange-100 text-orange-700"
                }`}>
                {material.status}
              </span>

              {/* Comments */}
              {material.admin_comments && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border">
                  {material.admin_comments}
                </p>
              )}

              {/* ✅ Review Button */}
              {material.status === "Pending" && (
                <div className="pt-3 border-t border-slate-200">
                  <Button
                    className="w-full bg-slate-900 text-white rounded-sm text-xs"
                    onClick={() => {
                      setSelectedMaterial(material);
                      setAction({ status: "Approved", comments: "" });
                      setOpen(true);
                    }}>
                    Review Request
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ Empty */}
      {materials.length === 0 && (
        <p className="text-center text-slate-500">
          No material requests in this project ✅
        </p>
      )}

      {/* ✅ Review Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase tracking-tight">
              Review Material: {selectedMaterial?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Decision */}
            <Select
              value={action.status}
              onValueChange={(value) =>
                setAction({ ...action, status: value })
              }>
              <SelectTrigger className="rounded-sm">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Approved">Approve</SelectItem>
                <SelectItem value="Rejected">Reject</SelectItem>
              </SelectContent>
            </Select>

            {/* Comments */}
            <Textarea
              value={action.comments}
              onChange={(e) =>
                setAction({ ...action, comments: e.target.value })
              }
              placeholder="Add comments..."
              rows={4}
              className="rounded-sm border-slate-300 bg-slate-50"
            />

            {/* Submit */}
            <Button
              onClick={handleApprove}
              className="w-full bg-slate-900 rounded-sm">
              Submit Review ✅
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMaterials;
