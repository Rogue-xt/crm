"use client";

import { useState } from "react";
import { useRef } from "react";
import {
  SheetContent, // Keep this
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Camera,
  Landmark,
  HeartPulse,
  MapPin,
  Mail,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { updateEmployee } from "@/actions/employee-actions";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function StaffDetailsDrawer({ employee, designations ,departments}: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    employee.imageUrl,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const res = await updateEmployee(employee.id, data);
      if (res?.error) {
        toast.error("Sync Failed", { description: res.error });
      } else {
        toast.success("Ledger Updated", {
          description: "Employee records synchronized successfully.",
        });
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Critical error during synchronization");
    } finally {
      setLoading(false);
    }
  }

  // RETURN ONLY THE CONTENT
  return (
    <SheetContent className="sm:max-w-[540px] p-0 border-none bg-slate-50 overflow-y-auto custom-scrollbar">
      <form onSubmit={handleSubmit}>
        {/* HEADER SECTION */}
        <div className="bg-slate-950 p-8 text-white relative">
          <div className="flex justify-between items-start mb-6">
            {/* PROFILE IMAGE EDIT */}
            <div className="relative group">
              <div
                onClick={() => isEditing && fileInputRef.current?.click()}
                className={`h-24 w-24 rounded-[2.5rem] bg-indigo-500/20 border-2 overflow-hidden transition-all ${
                  isEditing
                    ? "border-dashed border-indigo-400 cursor-pointer hover:bg-indigo-500/40"
                    : "border-indigo-400/30"
                }`}
              >
                <img
                  src={imagePreview || "https://avatar.iran.liara.run/public"}
                  alt="Avatar"
                  className={`h-full w-full object-cover ${isEditing ? "opacity-50" : ""}`}
                />
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
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

            <Button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`${isEditing ? "bg-rose-500 hover:bg-rose-600" : "bg-indigo-500 hover:bg-indigo-600"} rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-widest transition-all`}
            >
              {isEditing ? (
                <>
                  <X className="h-3 w-3 mr-2" /> Cancel
                </>
              ) : (
                <>
                  <Edit2 className="h-3 w-3 mr-2" /> Edit Records
                </>
              )}
            </Button>
          </div>

          <SheetHeader className="text-left space-y-4">
            <div>
              <p className="text-indigo-400 font-black italic text-[10px] uppercase tracking-[0.3em] mb-1">
                Personnel ID: {employee.employeeId}
              </p>

              {/* NAME EDIT */}
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    name="firstName"
                    defaultValue={employee.firstName}
                    className="bg-white/10 border-white/20 text-white font-black italic uppercase text-xl h-12 rounded-xl"
                  />
                  <Input
                    name="lastName"
                    defaultValue={employee.lastName}
                    className="bg-white/10 border-white/20 text-indigo-400 font-black italic uppercase text-xl h-12 rounded-xl"
                  />
                </div>
              ) : (
                <SheetTitle className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">
                  {employee.firstName}{" "}
                  <span className="text-indigo-400">{employee.lastName}</span>
                </SheetTitle>
              )}
            </div>

            {/* DESIGNATION & DEPT EDIT */}
            <div className="flex gap-2 mt-4">
              {isEditing ? (
                <>
                  <Select
                    name="designationId"
                    defaultValue={employee.designationId}
                  >
                    <SelectTrigger className="bg-white/10 border-white/10 text-[9px] font-bold uppercase h-8 rounded-lg text-white">
                      <SelectValue placeholder="Designation" />
                    </SelectTrigger>
                    <SelectContent>
                      {designations.map((d: any) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    name="departmentId"
                    defaultValue={employee.departmentId}
                  >
                    <SelectTrigger className="bg-white/10 border-white/10 text-[9px] font-bold uppercase h-8 rounded-lg text-white">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d: any) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <span className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-white/5">
                    {employee.designation?.name}
                  </span>
                  <span className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-white/5">
                    {employee.department?.name}
                  </span>
                </>
              )}
            </div>
          </SheetHeader>
        </div>

        <div className="p-8 space-y-8">
          {/* CORE DETAILS */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" /> Professional Contact
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase">
                  Email Address
                </label>
                <Input
                  name="email"
                  defaultValue={employee.email}
                  disabled={!isEditing}
                  className="bg-white rounded-xl border-none shadow-sm font-bold text-xs h-11"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase">
                  Phone Number
                </label>
                <Input
                  name="phone"
                  defaultValue={employee.phone}
                  disabled={!isEditing}
                  className="bg-white rounded-xl border-none shadow-sm font-bold text-xs h-11"
                />
              </div>
            </div>
          </section>

          {/* NEW: EMERGENCY SECTION */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] flex items-center gap-2">
              <HeartPulse className="h-3.5 w-3.5" /> Emergency Protocol
            </h3>
            <div className="bg-rose-50/50 p-5 rounded-[2rem] border border-rose-100 grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-rose-400 uppercase">
                  Primary Kin
                </label>
                <Input
                  name="emergencyName"
                  defaultValue={employee.emergencyName}
                  disabled={!isEditing}
                  className="bg-white rounded-xl border-none shadow-sm font-bold text-xs h-10"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-rose-400 uppercase">
                  Contact Number
                </label>
                <Input
                  name="emergencyPhone"
                  defaultValue={employee.emergencyPhone}
                  disabled={!isEditing}
                  className="bg-white rounded-xl border-none shadow-sm font-bold text-xs h-10"
                />
              </div>
            </div>
          </section>

          {/* NEW: BANKING SECTION */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] flex items-center gap-2">
              <Landmark className="h-3.5 w-3.5" /> Financial Settlement
            </h3>
            <div className="bg-indigo-50/50 p-5 rounded-[2rem] border border-indigo-100 space-y-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-indigo-400 uppercase">
                  Bank Name
                </label>
                <Input
                  name="bankName"
                  defaultValue={employee.bankName}
                  disabled={!isEditing}
                  className="bg-white rounded-xl border-none shadow-sm font-bold text-xs h-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-indigo-400 uppercase">
                    IBAN
                  </label>
                  <Input
                    name="iban"
                    defaultValue={employee.iban}
                    disabled={!isEditing}
                    className="bg-white rounded-xl border-none shadow-sm font-bold text-[10px] h-10 uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-indigo-400 uppercase">
                    Swift Code
                  </label>
                  <Input
                    name="swiftCode"
                    defaultValue={employee.swiftCode}
                    disabled={!isEditing}
                    className="bg-white rounded-xl border-none shadow-sm font-bold text-[10px] h-10 uppercase"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ADDRESS SECTION */}
          <section className="space-y-4 pb-12">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-amber-500" /> Physical
              Logistics
            </h3>
            <textarea
              name="fullAddress"
              defaultValue={employee.fullAddress}
              disabled={!isEditing}
              className="w-full bg-white rounded-[1.5rem] border-none shadow-sm font-bold text-xs p-4 h-24 resize-none outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-70"
            />
          </section>
        </div>

        {isEditing && (
          <div className="sticky bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 flex gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-slate-950 text-white rounded-2xl h-14 font-black uppercase text-xs italic tracking-widest shadow-xl"
            >
              {loading ? (
                "Synchronizing..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2 text-indigo-400" /> Save
                  Database Changes
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </SheetContent>
  );
}
