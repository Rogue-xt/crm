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

  // Filter for the "Reports To" dropdown logic
  const managers = employees.filter((e) =>
    ["MANAGER", "SUPERVISOR", "HR"].includes(e.role),
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
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className={`group relative p-6 rounded-3xl border transition-all duration-500 z-0 hover:z-10  ${
                emp.status === "INACTIVE"
                  ? "bg-slate-100/50 border-slate-200 grayscale opacity-60"
                  : "bg-white border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10"
              }`}
            >
              {/* Action Menu */}
              <div className="absolute top-4 right-4">
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-2xl border-slate-100 p-2 shadow-xl w-48"
                  >
                    {/* EDIT MODAL COMPONENT */}
                    <EditModal
                      employee={emp}
                      departments={departments}
                      designations={designations}
                      managers={managers}
                    />

                    <DropdownMenuSeparator className="bg-slate-50" />

                    {/* STATUS TOGGLE CLIENT COMPONENT */}
                    <StatusToggle id={emp.id} status={emp.status} />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Profile Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
                  {emp.imageUrl ? (
                    <Image
                      alt="profile"
                      src={emp.imageUrl}
                      width={48}
                      height={48}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-slate-50 flex items-center justify-center">
                      <span className="text-slate-300 font-black italic text-sm uppercase">
                        {emp.firstName[0]}
                        {emp.lastName[0]}
                      </span>
                    </div>
                  )}
                </div>
                <Badge
                  className={`border-none text-[9px] font-black px-2 uppercase tracking-widest ${
                    emp.status === "ACTIVE"
                      ? "bg-green-50 text-green-600"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {emp.status}
                </Badge>
              </div>

              {/* Details Section */}
              <div className="space-y-1 mb-6">
                <p className="text-[10px] font-black text-[#FF9E7D] uppercase tracking-widest">
                  {emp.employeeId}
                </p>
                <h3 className="text-lg font-black italic tracking-tighter uppercase text-slate-900">
                  {emp.firstName} {emp.lastName}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {emp.designation?.name || "No Title"} •{" "}
                  {emp.department?.name || "No Dept"}
                </p>
              </div>

              {/* Contact Footer */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 italic">
                  <Mail className="h-3 w-3 text-slate-300" /> {emp.email}
                </div>
                {emp.phone && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 italic">
                    <Phone className="h-3 w-3 text-slate-300" /> {emp.phone}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {employees.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <Users className="h-10 w-10 mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                No staff records found. Onboard your first employee.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
