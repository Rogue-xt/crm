"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function onboardEmployee(data: any) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 1. Get the current user and their company's ID generation settings
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        company: {
          select: {
            id: true,
            empIdPrefix: true,
            nextEmpNumber: true,
          },
        },
      },
    });

    if (!dbUser?.company) throw new Error("Company settings not found");

    const result = await prisma.$transaction(async (tx) => {
      // 2. Format the Employee ID (e.g., "TCS-1001")
      // We generate this INSIDE the transaction to prevent duplicates
      const generatedId = `${dbUser.company.empIdPrefix}${dbUser.company.nextEmpNumber}`;

      // 3. Create the Employee
      const employee = await tx.employee.create({
        data: {
          employeeId: generatedId,
          imageUrl: data.imageUrl || null,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          altPhone: data.altPhone || null,
          joiningDate: data.joiningDate
            ? new Date(data.joiningDate)
            : new Date(),
          probationDays: Number(data.probationDays) || 90,
          fullAddress: data.address, // Mapping your 'address' to 'fullAddress'
          city: data.city,
          country: data.country || "United Arab Emirates",
          designationId: data.designationId,
          departmentId: data.departmentId,
          role: data.role || "STAFF",
          reportingToId: data.reportingToId || null,
          companyId: dbUser.company.id,
          status: "ACTIVE",
        },
      });

      // 4. Increment the counter in the Company table
      await tx.company.update({
        where: { id: dbUser.company.id },
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
    // 1. Prepare the update object
    const updateData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      fullAddress: data.fullAddress, // Ensure this matches your schema field name
      city: data.city,
      country: data.country,
      designationId: data.designationId,
      departmentId: data.departmentId,
      reportingToId: data.reportingToId === "" ? null : data.reportingToId,

      // NEW FIELDS: Explicitly map these from the form
      emergencyName: data.emergencyName,
      emergencyPhone: data.emergencyPhone,
      bankName: data.bankName,
      iban: data.iban,
      swiftCode: data.swiftCode,
    };

    // 2. Image Logic: Only update if a new string is provided
    // This prevents the "disappearing photo" bug
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
    console.error("Update Error:", error);
    return { error: error.message || "Failed to update employee" };
  }
}

