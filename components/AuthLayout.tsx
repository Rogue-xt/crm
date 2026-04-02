"use client";

import { useUser, SignIn, SignUp } from "@clerk/nextjs";
import { Sidebar } from "@/components/Sidebar";
import { usePathname } from "next/navigation"; // Add this

interface AuthLayoutProps {
  children: React.ReactNode;
  dbUser: any;
}

export function AuthLayout({ children, dbUser }: AuthLayoutProps) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname(); // Get current URL

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

  // 1. ALLOW SIGN-UP PATH
  if (!user && pathname === "/sign-up") {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900 px-4">
        <SignUp routing="hash" />
      </div>
    );
  }

  // 2. FORCE SIGN-IN FOR EVERYTHING ELSE
  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900 px-4">
        <SignIn routing="hash" />
      </div>
    );
  }

  // 3. LOGGED IN BUT NO DB RECORD (UNAUTHORIZED)
  if (user && !dbUser) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-center px-6">
        <h2 className="text-2xl font-bold text-white">Access Denied</h2>
        <p className="text-slate-400 mt-2">
          Your email is not registered with any company.
        </p>
        <button
          onClick={() => (window.location.href = "mailto:support@alsaqr.ae")}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold"
        >
          Contact Admin
        </button>
      </div>
    );
  }

  return (
    <div className="h-full relative bg-slate-50 min-h-screen text-slate-900">
      <Sidebar
        user={dbUser}
        companyName={dbUser?.company?.name || "No Company Linked"}
      />
      <main className="lg:pl-72 pt-20 lg:pt-0">
        <div className="max-w-7xl mx-auto ">{children}</div>
      </main>
    </div>
  );
}
