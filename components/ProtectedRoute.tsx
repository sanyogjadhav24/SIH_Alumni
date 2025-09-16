"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "../app/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Optional: redirect automatically if user is not logged in
  useEffect(() => {
    if (!loading && !user) {
      // Uncomment below if you want automatic redirect instead of warning page
      // router.push("/auth/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">You are not allowed to access this page. Please log in first.</p>
        <Button onClick={() => router.push("/auth/login")}>Go to Login</Button>
      </div>
    );
  }

  return <>{children}</>;
}
