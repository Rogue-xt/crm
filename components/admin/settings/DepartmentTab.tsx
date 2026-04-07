"use client";

import { useState } from "react";
import { createDepartment, updateDepartment } from "@/actions/org-actions"; // Added update action
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  GitMerge,
  Building2,
  UserCheck,
  Plus,
  ChevronRight,
  Layers,
  ArrowRight,
  Edit2,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export function DepartmentTab({
  departments = [],
  employees = [],
}: {
  departments: any[];
  employees: any[];
}) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | "none">("none");
  const [managerId, setManagerId] = useState<string | "none">("none");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const res = await createDepartment({
      name,
      parentId: parentId === "none" ? null : parentId,
      managerId: managerId === "none" ? null : managerId,
    });

    if (res.success) {
      toast.success("Structure Updated Successfully");
      setName("");
      setParentId("none");
      setManagerId("none");
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  const mainDepartments = departments.filter((d) => !d.parentId);

  return (
    <div className="space-y-8">
      {/* SECTION 1: THE ARCHITECT (ADD FORM) */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <GitMerge className="h-40 w-40 text-white" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">
                Unit <span className="text-indigo-400">Architect</span>
              </h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                Define the organizational skeleton
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">
                Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sales, SEO Team"
                className="rounded-xl border-none bg-white/5 text-white h-12 focus-visible:ring-indigo-500 placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">
                Parent Division
              </label>
              <Select onValueChange={setParentId} value={parentId}>
                <SelectTrigger className="rounded-xl border-none bg-white/5 text-white h-12">
                  <SelectValue placeholder="Standalone" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-800 bg-slate-900 text-slate-200">
                  <SelectItem value="none">Standalone Unit</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      Under {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">
                Assign Lead
              </label>
              <Select onValueChange={setManagerId} value={managerId}>
                <SelectTrigger className="rounded-xl border-none bg-white/5 text-white h-12">
                  <SelectValue placeholder="No Lead" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-800 bg-slate-900 text-slate-200">
                  <SelectItem value="none">Set Later (Vacant)</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAdd}
              disabled={loading || !name}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 h-12 font-black uppercase text-xs tracking-widest transition-all hover:scale-[1.02]"
            >
              {loading ? "Syncing..." : "Build Unit"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* SECTION 2: THE VISUAL TREE */}
      <Card className="border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden bg-white p-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em]">
              Corporate Hierarchy
            </h3>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <div className="space-y-4">
            {mainDepartments.map((dept) => (
              <DepartmentTree
                key={dept.id}
                dept={dept}
                allDepts={departments}
                employees={employees}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function DepartmentTree({ dept, allDepts, level = 0, employees = [] }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(dept.name);
  const [editManagerId, setEditManagerId] = useState(dept.managerId || "none");
  const [loading, setLoading] = useState(false);

  const children = allDepts.filter((d: any) => d.parentId === dept.id);

  const handleUpdate = async () => {
    setLoading(true);
    const res = await updateDepartment(dept.id, {
      name: editName,
      managerId: editManagerId === "none" ? null : editManagerId,
    });
    if (res.success) {
      toast.success("Unit updated");
      setIsEditing(false);
    } else {
      toast.error("Update failed");
    }
    setLoading(false);
  };

  return (
    <div className="relative">
      {level > 0 && (
        <div
          className="absolute left-[-20px] top-[-10px] w-6 h-10 border-l-2 border-b-2 border-slate-100 rounded-bl-xl"
          style={{ left: `${(level - 1) * 32 + 20}px` }}
        />
      )}

      <div
        className={`group flex justify-between items-center p-5 rounded-3xl transition-all ${
          level === 0
            ? "bg-slate-50 border border-slate-100 shadow-sm"
            : "bg-white border border-transparent hover:border-slate-100"
        }`}
        style={{ marginLeft: `${level * 32}px` }}
      >
        <div className="flex items-center gap-4 flex-1">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${
              level === 0
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-400 border border-slate-100"
            }`}
          >
            <Building2 className="h-5 w-5" />
          </div>

          {isEditing ? (
            <div className="flex gap-2 items-center flex-1">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-8 rounded-lg text-xs font-bold w-40"
              />
              <Select onValueChange={setEditManagerId} value={editManagerId}>
                <SelectTrigger className="h-8 rounded-lg text-xs font-bold w-40">
                  <SelectValue placeholder="Assign Lead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Lead</SelectItem>
                  {employees.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <p className="text-sm font-black italic tracking-tighter uppercase text-slate-900 leading-tight">
                {dept.name}
              </p>
              <div className="flex items-center gap-3 mt-1">
                {dept.manager ? (
                  <p className="text-[9px] font-bold text-indigo-500 uppercase flex items-center gap-1">
                    <UserCheck className="h-3 w-3" /> {dept.manager.firstName}{" "}
                    {dept.manager.lastName}
                  </p>
                ) : (
                  <p className="text-[9px] font-bold text-amber-500 uppercase flex items-center gap-1 italic">
                    <AlertCircle className="h-3 w-3" /> No Lead Assigned
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex gap-1">
              <Button
                onClick={handleUpdate}
                disabled={loading}
                size="icon"
                className="h-8 w-8 rounded-lg bg-emerald-500 hover:bg-emerald-600"
              >
                <Check className="h-4 w-4 text-white" />
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-lg"
              >
                <X className="h-4 w-4 text-slate-400" />
              </Button>
            </div>
          ) : (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 className="h-3 w-3 text-slate-400" />
              </Button>
              <div className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                {dept.employees?.length || 0} Staff
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-2 space-y-2">
        {children.map((child: any) => (
          <DepartmentTree
            key={child.id}
            dept={child}
            allDepts={allDepts}
            level={level + 1}
            employees={employees}
          />
        ))}
      </div>
    </div>
  );
}
