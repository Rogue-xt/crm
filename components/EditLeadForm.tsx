"use client";

import { useState } from "react";
import { updateLeadDetails } from "@/actions/lead-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save, AlertCircle } from "lucide-react";

export function EditLeadForm({
  lead,
  onSuccess,
}: {
  lead: any;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const result = await updateLeadDetails(lead.id, data);
    setLoading(false);
    if (result.success) onSuccess();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center gap-3 mb-4">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">
          Updating Lead Profile: Ensure UAE Phone Formats are correct
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-slate-400 uppercase">
            Contact Name
          </Label>
          <Input
            name="name"
            defaultValue={lead.name}
            className="bg-white border-slate-200 focus:border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-slate-400 uppercase">
            Designation
          </Label>
          <Input
            name="designation"
            defaultValue={lead.designation}
            placeholder="e.g. CEO"
            className="bg-white border-slate-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-slate-400 uppercase">
            Email Address
          </Label>
          <Input
            name="email"
            type="email"
            defaultValue={lead.email}
            className="bg-white border-slate-200"
          />
        </div>
        <div className="space-y-2">
          <Label
            className={`text-[10px] font-black uppercase ${!lead.phone ? "text-rose-500" : "text-slate-400"}`}
          >
            Phone Number {!lead.phone && "(REQUIRED)"}
          </Label>
          <Input
            name="phone"
            defaultValue={lead.phone}
            placeholder="+971..."
            className={`bg-white ${!lead.phone ? "border-rose-200 focus:border-rose-500" : "border-slate-200"}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-slate-400 uppercase">
            Organization
          </Label>
          <Input
            name="company"
            defaultValue={lead.clientCompany}
            className="bg-white border-slate-200"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-slate-400 uppercase">
            Deal Value (AED)
          </Label>
          <Input
            name="value"
            type="number"
            defaultValue={lead.value}
            className="bg-white border-slate-200"
          />
        </div>
      </div>

      <Button
        disabled={loading}
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-12 shadow-lg mt-4"
      >
        {loading ? (
          <Loader2 className="animate-spin h-5 w-5" />
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" /> UPDATE LEAD PROFILE
          </>
        )}
      </Button>
    </form>
  );
}
