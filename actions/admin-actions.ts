"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function createNewCompany(formData: FormData) {
  const { userId } = await auth();

  // 1. Security Check: Only the Super Admin should do this
  const sender = await prisma.user.findUnique({
    where: { clerkId: userId as string },
  });

  if (sender?.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const companyName = formData.get("companyName") as string;
  const adminEmail = formData.get("adminEmail") as string;
  const adminName = formData.get("adminName") as string;

  try {
    // 2. Create the Company and the Admin User in one transaction
    const newCompany = await prisma.company.create({
      data: {
        name: companyName,
        users: {
          create: {
            email: adminEmail,
            name: adminName,
            role: "ADMIN",
            // Note: clerkId is left empty.
            // Our Auto-Sync logic in layout.tsx will catch it when they first log in!
          },
        },
      },
    });

    revalidatePath("/");
    return { success: true, id: newCompany.id };
  } catch (error) {
    console.error("Error creating company:", error);
    return { success: false, error: "Company name or Email already exists." };
  }
}
