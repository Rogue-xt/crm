"use client";

import { useState, useRef } from "react";
import { updateEmployee } from "@/actions/employee-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit2, Camera, X, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface EditModalProps {
  employee: any;
  departments: any[];
  designations: any[];
  managers: any[];
}

export function EditModal({
  employee,
  departments,
  designations,
  managers,
}: EditModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    employee.imageUrl,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid Format", { description: "Use JPG, PNG or WebP" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const res = await updateEmployee(employee.id, data);
      if (res?.error) {
        toast.error("Update Failed", { description: res.error });
      } else {
        toast.success("Profile Synchronized", {
          description: `${employee.firstName}'s records have been updated.`,
        });
        setOpen(false);
      }
    } catch (error) {
      toast.error("Critical Error during update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest p-3 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors w-full">
          <Edit2 className="h-3 w-3 text-blue-500" /> Edit Profile
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] border-none p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 p-8 text-white">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                <Edit2 className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                  Edit <span className="text-blue-400">Employee</span> Record
                </DialogTitle>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Database ID: {employee.employeeId}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 grid grid-cols-2 gap-x-6 gap-y-4 bg-white overflow-y-auto"
        >
          {/* Photo Edit */}
          <div className="col-span-2 flex flex-col items-center justify-center pb-6 border-b border-slate-50 mb-4">
            <div className="relative group">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-24 w-24 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-400 transition-all"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="h-full w-full object-cover"
                    alt="Preview"
                  />
                ) : (
                  <Camera className="h-6 w-6 text-slate-300" />
                )}
              </div>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute -top-1 -right-1 bg-rose-500 text-white p-1 rounded-lg"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
            <input type="hidden" name="imageUrl" value={imagePreview || ""} />
          </div>

          {/* Form Fields - Pre-filled with defaultValue */}
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
              First Name
            </label>
            <Input
              name="firstName"
              defaultValue={employee.firstName}
              required
              className="rounded-xl bg-slate-50 border-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
              Last Name
            </label>
            <Input
              name="lastName"
              defaultValue={employee.lastName}
              required
              className="rounded-xl bg-slate-50 border-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
              Official Email
            </label>
            <Input
              name="email"
              defaultValue={employee.email}
              type="email"
              required
              className="rounded-xl bg-slate-50 border-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
              Mobile
            </label>
            <Input
              name="phone"
              defaultValue={employee.phone}
              required
              className="rounded-xl bg-slate-50 border-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
              Department
            </label>
            <Select name="departmentId" defaultValue={employee.departmentId}>
              <SelectTrigger className="rounded-xl bg-slate-50 border-none font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
              Designation
            </label>
            <Select name="designationId" defaultValue={employee.designationId}>
              <SelectTrigger className="rounded-xl bg-slate-50 border-none font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {designations.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="col-span-2 h-14 bg-slate-900 rounded-2xl font-black uppercase text-xs italic tracking-widest mt-4 hover:bg-black"
          >
            {loading ? "SAVING CHANGES..." : "UPDATE STAFF PROFILE"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
