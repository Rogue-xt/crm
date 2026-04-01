"use client";

import { useUser } from "@clerk/nextjs";
import { SignIn } from "@clerk/nextjs";
import { Sidebar } from "@/components/Sidebar";

interface AuthLayoutProps {
  children: React.ReactNode;
  dbUser: any;
}

export function AuthLayout({ children, dbUser }: AuthLayoutProps) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-white text-lg font-medium">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900 px-4">
        <SignIn routing="hash" />
      </div>
    );
  }

  return (
    <div className="h-full relative bg-slate-50 min-h-screen">
      <Sidebar
        user={dbUser}
        companyName={dbUser?.company?.name || "No Company Linked"}
      />
      <main className="lg:pl-72 pt-20 lg:pt-0">
        <div className="max-w-7xl mx-auto ">{children}</div>
        {/* p-4 md:p-8 */}
      </main>
    </div>
  );
}
