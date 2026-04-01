"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function registerNewTenant(formData: FormData) {
  const { userId } = await auth();

  // 1. Security Check
  const sender = await prisma.user.findUnique({
    where: { clerkId: userId as string },
  });

  if (sender?.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized access." };
  }

  const companyName = formData.get("companyName") as string;
  const adminEmail = formData.get("adminEmail") as string;
  const adminName = formData.get("adminName") as string;
  const plan = formData.get("plan") as string;

  try {
    await prisma.$transaction(async (tx) => {
      // Create Company
      const company = await tx.company.create({
        data: {
          name: companyName,
          plan: plan || "BASIC",
        },
      });

      // Create Admin User linked to that Company
      await tx.user.create({
        data: {
          email: adminEmail,
          name: adminName,
          role: "ADMIN",
          companyId: company.id,
          // clerkId stays null until their first login (auto-sync)
        },
      });
    });

    revalidatePath("/super-admin");
    return { success: true };
  } catch (error) {
    console.error("Creation Error:", error);
    return { success: false, error: "Company or Email already exists." };
  }
}
