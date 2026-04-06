"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateCompanyERPConfig } from "@/actions/company-actions"; // Create this action
import { toast } from "sonner";
import { Hash, Fingerprint, Save } from "lucide-react";

export function ERPConfigForm({ company }: { company: any }) {
  const [prefix, setPrefix] = useState(company.empIdPrefix || "EMP-");
  const [nextNum, setNextNum] = useState(company.nextEmpNumber || 1001);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateCompanyERPConfig(company.id, { prefix, nextNumber: nextNum });
      toast.success("ERP Sequence updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-slate-900 rounded-2xl text-white">
          <Fingerprint className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">
            ID Generation <span className="ml-1 text-[#FF9E7D]">Sequence</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Configure how Axon ERP generates Employee & Lead IDs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
            Employee ID Prefix
          </label>
          <Input
            value={prefix}
            onChange={(e) => setPrefix(e.target.value.toUpperCase())}
            placeholder="e.g. AS-"
            className="rounded-xl border-slate-100 bg-slate-50 h-12 font-black italic text-lg"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
            Next Sequence Number
          </label>
          <Input
            type="number"
            value={nextNum}
            onChange={(e) => setNextNum(parseInt(e.target.value))}
            className="rounded-xl border-slate-100 bg-slate-50 h-12 font-black italic text-lg"
          />
        </div>

        <div className="col-span-2 p-4 bg-orange-50 rounded-2xl border border-orange-100">
          <p className="text-[10px] font-black text-[#FF9E7D] uppercase tracking-widest flex items-center gap-2">
            <Hash className="h-3 w-3" /> Preview
          </p>
          <p className="text-2xl font-black italic tracking-tighter text-slate-700 mt-1">
            {prefix}
            {nextNum.toString().padStart(4, "0")}
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="col-span-2 h-14 bg-slate-900 rounded-2xl font-black uppercase text-xs italic tracking-widest mt-4 hover:bg-black transition-all"
        >
          {loading ? "SAVING..." : "UPDATE ERP CONFIGURATION"}
        </Button>
      </div>
    </div>
  );
}
