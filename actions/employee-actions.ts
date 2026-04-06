"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function onboardEmployee(data: any) {
  try {
    const { userId } = await auth();
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId! },
      include: { company: true }, // Need company data for the ID
    });

    if (!dbUser) throw new Error("Unauthorized");

    // Wrap in a transaction for data integrity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Employee
      const employee = await tx.employee.create({
        data: {
          imageUrl: data.imageUrl || null,
          companyId: dbUser.companyId,
          employeeId: data.employeeId, // This is the 'TCS1001' passed from the modal
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          country: data.country,
          role: data.role,
          designationId: data.designationId,
          departmentId: data.departmentId,
          reportingToId: data.reportingToId === "" ? null : data.reportingToId,
        },
      });

      // 2. INCREMENT THE COUNTER for the next person
      await tx.company.update({
        where: { id: dbUser.companyId },
        data: {
          nextEmpNumber: { increment: 1 },
        },
      });

      return employee;
    });

    revalidatePath("/management/staff");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("ONBOARDING_ERROR:", error);
    // Return a structured error so Sonner can show the reason
    return {
      error:
        error.message ||
        "Failed to onboard employee. Check if Email or ID is unique.",
    };
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
    await prisma.employee.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        role: data.role,
        designationId: data.designationId,
        departmentId: data.departmentId,
        reportingToId: data.reportingToId === "" ? null : data.reportingToId,
        imageUrl: data.imageUrl || null,
      },
    });

    revalidatePath("/management/staff");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update employee" };
  }
}

