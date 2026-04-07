// app/settings/page.tsx
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsTabs } from "@/components/admin/SettingsTabs";

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get user and verify they have admin access
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { company: true },
  });

  if (!dbUser) {
    redirect("/");
  }

  // Only allow ADMIN and SUPER_ADMIN roles to access settings
  if (!["ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
    redirect("/");
  }

  // Get company data for settings
  const company = dbUser.company;
  if (!company) {
    redirect("/");
  }

  // --- FETCH ALL DATA HERE ---
  const [leadStatuses, departments, designations, employees] =
    await Promise.all([
      prisma.leadStatus.findMany({
        where: { companyId: company.id },
        orderBy: { order: "asc" },
      }),
      prisma.department.findMany({
        where: { companyId: company.id },
        include: {
          manager: true, // Crucial for showing the Lead Name in the list
          employees: true, // Useful for the staff count badge
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.designation.findMany({
        where: { companyId: company.id },
        orderBy: { createdAt: "desc" },
      }),
      // ADD THIS: Fetching the employee master list
      prisma.employee.findMany({
        where: { companyId: company.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
        orderBy: { firstName: "asc" },
      }),
    ]);


  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 italic uppercase">
          Settings
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Manage your workspace settings and preferences.
        </p>
      </div>

      <SettingsTabs
        company={company}
        initialStatuses={leadStatuses}
        userRole={dbUser.role}
        departments={departments}
        designations={designations}
        employees={employees} // PASS THE DATA HERE
      />
    </div>
  );
}
