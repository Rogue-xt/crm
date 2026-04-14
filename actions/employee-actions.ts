"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function onboardEmployee(data: any) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        company: {
          select: { id: true, empIdPrefix: true, nextEmpNumber: true },
        },
      },
    });

    if (!dbUser?.company) throw new Error("Company settings not found");

    const result = await prisma.$transaction(async (tx) => {
      const generatedId = `${dbUser.company.empIdPrefix}${dbUser.company.nextEmpNumber}`;

      // 3. Create the Employee (HR Record)
      const employee = await tx.employee.create({
        data: {
          employeeId: generatedId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          designationId: data.designationId,
          departmentId: data.departmentId,
          role: data.role || "STAFF",
          companyId: dbUser.company.id,
          status: "ACTIVE",
          // ... other fields
        },
      });

      // --- ADD THIS: 3.5 Create the User (Login Record) ---
      // This is what prevents "Access Denied"
      await tx.user.create({
        data: {
          email: data.email, // This MUST match the email they use to sign up
          name: `${data.firstName} ${data.lastName}`,
          companyId: dbUser.company.id,
          role:
            data.role === "SUPERVISOR" || data.role === "MANAGER"
              ? "MANAGER"
              : "SALES_EXECUTIVE",
          status: "ACTIVE",
          // Note: We leave clerkId null; your AuthLayout sync logic will fill it on first login
        },
      });

      // 4. Increment the counter
      await tx.company.update({
        where: { id: dbUser.company.id },
        data: { nextEmpNumber: { increment: 1 } },
      });

      return employee;
    });

    revalidatePath("/management/staff");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("ONBOARDING_ERROR:", error);

    // Handle Prisma unique constraint for Email or EmployeeID
    if (error.code === "P2002") {
      return { error: "An employee with this Email or ID already exists." };
    }

    return { error: error.message || "Failed to onboard employee." };
  }
}
export async function toggleEmployeeStatus(
  employeeId: string,
  currentStatus: string,
) {
  const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  await prisma.employee.update({
    where: { id: employeeId },
    data: { status: newStatus },
  });

  revalidatePath("/management/staff");
}

export async function updateEmployee(id: string, data: any) {
  try {
    const updateData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      fullAddress: data.fullAddress,

      // CRITICAL FIX: Convert empty strings to null for relations
      designationId: data.designationId || undefined,
      departmentId: data.departmentId || undefined,
      reportingToId:
        data.reportingToId === "" || data.reportingToId === "NONE"
          ? null
          : data.reportingToId,

      // New fields
      emergencyName: data.emergencyName,
      emergencyPhone: data.emergencyPhone,
      bankName: data.bankName,
      iban: data.iban,
      swiftCode: data.swiftCode,
    };

    if (data.imageUrl && data.imageUrl.trim() !== "") {
      updateData.imageUrl = data.imageUrl;
    }

    await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/management/staff");
    return { success: true };
  } catch (error: any) {
    console.error("Prisma Update Error:", error);
    // Return a cleaner error message to the UI
    if (error.code === "P2003") {
      return {
        error:
          "Foreign key failed: The selected Manager, Dept, or Designation is invalid.",
      };
    }
    return { error: error.message || "Failed to update employee" };
  }
}

