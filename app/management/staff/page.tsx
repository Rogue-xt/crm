import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OnboardModal } from "@/components/admin/management/OnboardModal";
import { EditModal } from "@/components/admin/management/EditModal";
// import { StatusToggle } from "@/components/management/StatusToggle";
import { Users, Mail, Phone, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusToggle } from "../StatusToggle";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { StaffDetailsDrawer } from "@/components/admin/management/StaffDetailsDrawer";
import { StaffCard } from "../StaffCard";

export default async function StaffManagementPage() {
  const { userId } = await auth();

  // 1. Fetch User & Company Data
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId! },
    include: { company: true },
  });

  if (!dbUser) redirect("/");

  const company = dbUser.company;

  // 2. Generate the dynamic ID for the Next Onboarding
  const nextId = `${company?.empIdPrefix}${company?.nextEmpNumber.toString().padStart(4, "0")}`;

  // 3. Parallel Fetch for Performance
  // --- 3. Parallel Fetch for Performance ---
  const [employees, departments, designations] = await Promise.all([
    prisma.employee.findMany({
      where: { companyId: dbUser.companyId },
      include: {
        department: true,
        designation: true,
        reportingTo: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.department.findMany({ where: { companyId: dbUser.companyId } }),
    prisma.designation.findMany({ where: { companyId: dbUser.companyId } }),
  ]);

  // --- NEW DYNAMIC FILTER ---
  // Instead of checking hard-coded roles, we check the designation's authority
  const managers = employees.filter(
    (e) => e.designation?.isManagement === true,
  );

  return (
    <div className="p-10 space-y-10 bg-[#F9FAFB] min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900">
            Staff <span className="text-[#FF9E7D]">Management</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Manage your team and organizational hierarchy.
          </p>
        </div>
        <OnboardModal
          departments={departments}
          designations={designations}
          managers={managers}
          nextId={nextId}
        />
      </div>

      {/* Staff Grid Container */}
      <div className="rounded-[2.5rem] border border-slate-100 shadow-sm p-8 bg-white/80">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {employees.map((emp) => (
            <StaffCard
              key={emp.id}
              emp={emp}
              departments={departments}
              designations={designations}
              managers={managers}
            />
          ))}

          {employees.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <Users className="h-10 w-10 mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                No staff records found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
