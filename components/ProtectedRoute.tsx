"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // Show nothing while checking auth
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-f1-red border-t-transparent" />
      </div>
    );
  }

  // If not authenticated, show nothing (redirect will happen)
  if (!user) {
    return null;
  }

  // Authenticated — render children
  return <>{children}</>;
}