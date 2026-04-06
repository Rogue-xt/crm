import { ClerkProvider } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthLayout } from "@/components/AuthLayout";
import { prisma } from "@/lib/prisma";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const clerkUser = await currentUser();

  let dbUser = null;

  if (userId) {
    // 1. Primary Check: Find by Clerk ID
    dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        company: true,
        department: true,
        designation: true,
      },
    });

    // 2. AUTO-SYNC BRIDGE: If Clerk ID isn't linked yet, match by Email
    if (!dbUser && clerkUser?.emailAddresses[0]?.emailAddress) {
      const email = clerkUser.emailAddresses[0].emailAddress;

      try {
        // We use a transaction to ensure both User and Invitation update together
        dbUser = await prisma.$transaction(async (tx) => {
          const updatedUser = await tx.user.update({
            where: { email: email },
            data: {
              clerkId: userId,
              status: "ACTIVE", // Move from PENDING to ACTIVE
            },
            include: {
              company: true,
              department: true,
              designation: true,
            },
          });

          // Mark any invitations for this email/company as accepted
          await tx.companyInvitation.updateMany({
            where: {
              email: email,
              companyId: updatedUser.companyId,
              status: "PENDING",
            },
            data: { status: "ACCEPTED" },
          });

          return updatedUser;
        });

        console.log(
          `✅ AUTO-SYNC SUCCESS: Linked ${email} to ${dbUser?.company?.name}`,
        );
      } catch (error) {
        // This means the user signed up with an email that isn't in your DB yet
        console.log(
          "⚠️ AUTO-SYNC SKIP: No pre-registered user found for this email.",
        );
      }
    }
  }

  return (
    <ClerkProvider>
      <html lang="en" className="">
        <body
          className={`${inter.className} bg-slate-950 text-slate-200 antialiased`}
        >
          {/* AuthLayout handles the sidebar/topbar logic. 
              If dbUser is null but userId exists, AuthLayout should 
              ideally show a "Waiting for Approval" or "Contact Admin" screen.
          */}
          <AuthLayout dbUser={dbUser}>{children}</AuthLayout>
          <Toaster position="top-right" richColors closeButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
