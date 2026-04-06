"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateCompanyERPConfig(
  companyId: string,
  data: { prefix: string; nextNumber: number },
) {
  await prisma.company.update({
    where: { id: companyId },
    data: {
      empIdPrefix: data.prefix.toUpperCase(),
      nextEmpNumber: data.nextNumber,
    },
  });
  revalidatePath("/settings");
}
