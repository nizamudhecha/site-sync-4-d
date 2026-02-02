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

import { toast } from "sonner";

import { Plus, Package, CheckCircle, XCircle, Clock } from "lucide-react";

import { useParams } from "react-router-dom";

const EngineerMaterials = () => {
  // ✅ ProjectId URL se direct milega
  const { projectId } = useParams();

  const [materials, setMaterials] = useState([]);
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    required_date: "",
  });

  // ✅ Load Materials (Project Wise)
  useEffect(() => {
    fetchMaterials();
  }, [projectId]);

  // ✅ Fetch Only This Project Materials
  const fetchMaterials = async () => {
    try {
      const res = await apiClient.get(`/materials?project_id=${projectId}`);

      setMaterials(res.data);
    } catch {
      toast.error("Failed to fetch material requests ❌");
    }
  };

  // ✅ Submit Request Direct ProjectId ke sath
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await apiClient.post("/materials/request", {
        project_id: projectId, // ✅ Auto Fixed
        ...formData,
      });

      toast.success("Material request submitted ✅");

      setFormData({
        name: "",
        quantity: "",
        required_date: "",
      });

      setOpen(false);

      fetchMaterials();
    } catch {
      toast.error("Failed to submit request ❌");
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
      {/* ✅ Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
          Material Requests
        </h3>

        {/* ✅ Request Modal */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 text-white rounded-sm">
              <Plus className="w-4 h-4 mr-2" />
              Request Material
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase">
                Request Material
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ✅ Material Name */}
              <div>
                <Label className="text-xs font-medium uppercase">
                  Material Name
                </Label>

                <Input
                  required
                  value={formData.name}
                  placeholder="e.g., Cement, Steel"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              {/* ✅ Quantity */}
              <div>
                <Label className="text-xs font-medium uppercase">
                  Quantity
                </Label>

                <Input
                  required
                  value={formData.quantity}
                  placeholder="e.g., 100 bags"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: e.target.value,
                    })
                  }
                />
              </div>

              {/* ✅ Required Date */}
              <div>
                <Label className="text-xs font-medium uppercase">
                  Required By
                </Label>

                <Input
                  type="date"
                  required
                  value={formData.required_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      required_date: e.target.value,
                    })
                  }
                />
              </div>

              {/* ✅ Submit */}
              <Button type="submit" className="w-full bg-slate-900">
                Submit Request ✅
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ✅ Material Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((m) => (
          <Card
            key={m.material_id}
            className="border-slate-200 rounded-md technical-shadow">
            {/* ✅ Header */}
            <CardHeader className="border-b border-slate-200">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-slate-400" />
                  <CardTitle className="text-sm font-semibold text-slate-900">
                    {m.name}
                  </CardTitle>
                </div>

                {getStatusIcon(m.status)}
              </div>
            </CardHeader>

            {/* ✅ Content */}
            <CardContent className="p-4 space-y-3">
              {/* Quantity */}
              <div>
                <p className="text-xs font-medium text-slate-500">Quantity</p>
                <p className="text-sm text-slate-900">{m.quantity}</p>
              </div>

              {/* Required Date */}
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Required By
                </p>
                <p className="text-sm text-slate-900">
                  {new Date(m.required_date).toLocaleDateString()}
                </p>
              </div>

              {/* Status Badge */}
              <span
                className={`inline-block text-xs font-medium px-2 py-1 rounded-sm ${
                  m.status === "Approved"
                    ? "bg-green-100 text-green-700"
                    : m.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-orange-100 text-orange-700"
                }`}>
                {m.status}
              </span>

              {/* Admin Comments */}
              {m.admin_comments && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border">
                  {m.admin_comments}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ Empty */}
      {materials.length === 0 && (
        <p className="text-center text-slate-500 py-8">
          No material requests yet ✅
        </p>
      )}
    </div>
  );
};

export default EngineerMaterials;
