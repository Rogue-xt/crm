import { ClerkProvider, SignIn } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server"; // Added currentUser
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthLayout } from "@/components/AuthLayout";
import { prisma } from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const user = await currentUser(); // Get the full Clerk user object (for email)

  console.log("CHECK 1: Clerk UserID is:", userId);

  let dbUser = null;

  if (userId) {
    // 1. Try to find the user by their Clerk ID
    dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { company: true },
    });

    // 2. AUTO-SYNC: If user exists in DB by email but doesn't have a Clerk ID yet
    if (!dbUser && user?.emailAddresses[0]?.emailAddress) {
      const email = user.emailAddresses[0].emailAddress;

      try {
        dbUser = await prisma.user.update({
          where: { email: email },
          data: { clerkId: userId },
          include: { company: true },
        });
        console.log(`AUTO-SYNC SUCCESS: Linked Clerk ID to ${email}`);
      } catch (error) {
        console.log("AUTO-SYNC SKIP: Email not found in database yet.", error);
      }
    }

    console.log("CHECK 2: Database User found:", dbUser?.name);
    console.log("CHECK 3: Database Company found:", dbUser?.company?.name);
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <AuthLayout dbUser={dbUser}>{children}</AuthLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
