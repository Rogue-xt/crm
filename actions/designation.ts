"use server";

import { prisma as db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateDesignationAuthority(
  id: string,
  isManagement: boolean,
) {
  try {
    const updated = await db.designation.update({
      where: { id: id }, // Ensure this is the correct ID string
      data: { isManagement: isManagement },
    });

    // Revalidate the specific settings page to force a data refresh
    revalidatePath("/settings");

    return { success: true, designation: updated };
  } catch (error) {
    console.error("DATABASE_ERROR:", error);
    return { error: "Database update failed." };
  }
}
