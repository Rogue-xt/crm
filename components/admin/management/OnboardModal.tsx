"use client";

import { useEffect, useRef, useState } from "react";
import { onboardEmployee } from "@/actions/employee-actions";
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
import {
  UserPlus,
  MapPin,
  Globe,
  Camera,
  X,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";




interface ModalProps {
  nextId: string;
  departments: any[];
  designations: any[];
  managers: any[];
}

export function OnboardModal({
  departments,
  designations,
  managers,
  nextId,
}: ModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Professional Format Check
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported Format", {
        description: "Please upload a JPG, PNG, or WebP image.",
        style: { background: "#1e293b", color: "#fff", border: "none" },
      });
      // Clear the input so they can try again
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Size Check (Prevent 10MB+ files from slowing the ERP)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File Too Large", {
        description: "Image must be under 2MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

  const formData = new FormData(e.currentTarget);
  const data = Object.fromEntries(formData);

  try {
    const response = await onboardEmployee(data);

    if (response?.error) {
      // This shows the actual reason (e.g., "Email already exists")
      toast.error("Onboarding Failed", {
        description: response.error,
      });
    } else {
      // SUCCESS
      toast.success("Staff Onboarded Successfully", {
        description: `${data.firstName} ${data.lastName} is now active.`,
      });
      setImagePreview(null);
      setOpen(false); // This closes the modal

      // OPTIONAL: Since we are in a modal, a hard refresh ensures
      // the next ID and the list are perfectly synced.
      window.location.reload();
    }
  } catch (error) {
    toast.error("Critical Error", {
      description: "Could not connect to the server.",
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#FF9E7D] hover:bg-[#ff8a63] rounded-xl font-black uppercase text-[10px] tracking-widest px-6 italic h-11 border-none text-white shadow-lg shadow-orange-500/20">
          <UserPlus className="h-4 w-4 mr-2" /> Onboard Staff
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] border-none p-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header is fixed at the top */}
        <div className="bg-slate-950 p-8 text-white">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-[#FF9E7D]/20 rounded-2xl flex items-center justify-center border border-[#FF9E7D]/30">
                <ShieldCheck className="h-6 w-6 text-[#FF9E7D]" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                  New <span className="text-[#FF9E7D]">Employee</span>{" "}
                  Onboarding
                </DialogTitle>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Global Human Resource Management System
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-8 grid grid-cols-2 gap-x-6 gap-y-4 bg-white overflow-y-auto scrollbar-hide"
        >
          {/* Identity Section */}

          <div className="space-y-1 col-span-2">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 italic">
              General Identity
            </p>
          </div>
          {/* Profile Photo Section - Place at the very top of the form */}
          <div className="col-span-2 flex flex-col items-center justify-center pb-8 border-b border-slate-50 mb-4">
            <div className="relative group">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-28 w-28 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#FF9E7D] transition-all"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="h-full w-full object-cover rounded-2xl"
                    alt="Preview"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-300 group-hover:text-[#FF9E7D]">
                    <Camera className="h-6 w-6 mb-1" />
                    <span className="text-[8px] font-black uppercase tracking-widest">
                      Add Photo
                    </span>
                  </div>
                )}
              </div>

              {imagePreview && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagePreview(null);
                  }}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-xl shadow-lg hover:scale-110 transition-transform"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept=".jpg, .jpeg, .png, .webp" // Explicitly allow only these
              className="hidden"
            />
            {/* Pass the Base64 string to the form data */}
            <input type="hidden" name="imageUrl" value={imagePreview || ""} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
              Employee ID
            </label>
            <Input
              name="employeeId"
              value={nextId}
              readOnly
              className="rounded-xl border-slate-100 bg-slate-50 h-11 font-bold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
              Email Address
            </label>
            <Input
              name="email"
              type="email"
              placeholder="example: official@alsaqr.tech"
              required
              className="rounded-xl border-slate-100 bg-slate-50 h-11"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
              First Name
            </label>
            <Input
              name="firstName"
              required
              className="rounded-xl border-slate-100 bg-slate-50 h-11"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
              Last Name
            </label>
            <Input
              name="lastName"
              required
              className="rounded-xl border-slate-100 bg-slate-50 h-11"
            />
          </div>

          {/* Org Section */}
          <div className="space-y-1 col-span-2 pt-2">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 italic">
              Organization & Hierarchy
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
              Department
            </label>
            <Select name="departmentId" required>
              <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 h-11 font-bold uppercase text-[10px]">
                <SelectValue placeholder="Select Dept" />
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
            <Select name="designationId" required>
              <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 h-11 font-bold uppercase text-[10px]">
                <SelectValue placeholder="Select Title" />
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
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
              Role Type
            </label>
            <Select name="role" defaultValue="STAFF">
              <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 h-11 font-bold uppercase text-[10px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STAFF">STAFF</SelectItem>
                <SelectItem value="SUPERVISOR">SUPERVISOR</SelectItem>
                <SelectItem value="MANAGER">MANAGER</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
              Reports To
            </label>
            <Select name="reportingToId">
              <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 h-11 font-bold uppercase text-[10px]">
                <SelectValue placeholder="N/A (Direct)" />
              </SelectTrigger>
              <SelectContent>
                {managers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.firstName} {m.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Section */}
          <div className="space-y-1 col-span-2 pt-2">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 italic">
              Global & Contact
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
              <Globe className="h-2 w-2" /> Country
            </label>
            <Input
              name="country"
              defaultValue="United Arab Emirates"
              required
              className="rounded-xl border-slate-100 bg-slate-50 h-11"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
              <MapPin className="h-2 w-2" /> City
            </label>
            <Input
              name="city"
              placeholder="Ajman"
              className="rounded-xl border-slate-100 bg-slate-50 h-11"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
              Mobile Phone
            </label>
            <Input
              name="phone"
              required
              className="rounded-xl border-slate-100 bg-slate-50 h-11"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic">
              Full Address
            </label>
            <Input
              name="address"
              className="rounded-xl border-slate-100 bg-slate-50 h-11"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="col-span-2 h-14 bg-slate-900 rounded-2xl font-black uppercase text-xs italic tracking-widest mt-4 hover:bg-black transition-all"
          >
            {loading ? "PROCESSING..." : "CONFIRM EMPLOYEE REGISTRATION"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
