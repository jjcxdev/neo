"use client";

import { useAuth } from "@/lib/AuthContext";
import { LoginForm } from "./LoginForm";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoginForm />
      </div>
    );
  }

  return <>{children}</>;
}
