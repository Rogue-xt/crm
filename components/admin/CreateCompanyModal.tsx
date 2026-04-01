"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { registerNewTenant } from "@/actions/super-admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Building2, Mail, User, Shield } from "lucide-react";
import { toast } from "sonner"; // Or your preferred toast library

export function CreateCompanyModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerNewTenant(formData);

    if (result.success) {
      toast.success("New Client Onboarded Successfully!");
      setOpen(false);
      (e.target as HTMLFormElement).reset();
    } else {
      toast.error(result.error || "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-all active:scale-95 text-sm shadow-lg shadow-blue-500/20">
          <Plus className="h-4 w-4" />
          Onboard New Client
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic tracking-tighter text-blue-400">
            REGISTER TENANT
          </DialogTitle>
          <p className="text-slate-400 text-sm">
            Add a new company and their primary administrator.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Company Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Building2 className="h-3 w-3" /> Company Name
            </label>
            <input
              required
              name="companyName"
              placeholder="e.g. Al Saqr Technologies"
              className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Admin Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <User className="h-3 w-3" /> Admin Name
              </label>
              <input
                required
                name="adminName"
                placeholder="Manager Name"
                className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            {/* Plan Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Shield className="h-3 w-3" /> Plan
              </label>
              <select
                name="plan"
                className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
              >
                <option value="BASIC">Basic</option>
                <option value="PRO">Pro Business</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
          </div>

          {/* Admin Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Mail className="h-3 w-3" /> Administrator Email
            </label>
            <input
              required
              type="email"
              name="adminEmail"
              placeholder="admin@company.com"
              className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <p className="text-[10px] text-slate-500 italic">
              * The user will auto-sync when they log in with this email.
            </p>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white py-4 rounded-xl font-black uppercase tracking-tighter transition-all active:scale-95 shadow-xl shadow-blue-500/20"
          >
            {loading ? "Creating Workspace..." : "Confirm & Launch Tenant"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
