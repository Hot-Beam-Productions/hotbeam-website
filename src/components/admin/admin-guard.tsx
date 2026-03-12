"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./auth-provider";
import { AdminShell } from "./admin-shell";
import { LoadingSpinner } from "./loading-spinner";

const REMOVED_ADMIN_PATHS = new Set([
  "/admin/home",
  "/admin/about",
  "/admin/contact",
  "/admin/brand",
  "/admin/rentals/settings",
]);

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, configError } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const isRemovedAdminPath = REMOVED_ADMIN_PATHS.has(pathname);

  useEffect(() => {
    if (!loading && user && isRemovedAdminPath) {
      router.replace("/admin");
      return;
    }

    if (!loading && !user && !isLoginPage && !configError) {
      router.push("/admin/login");
    }
  }, [loading, user, isLoginPage, isRemovedAdminPath, router, configError]);

  if (loading) return <LoadingSpinner />;

  if (configError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="max-w-lg space-y-4 rounded-lg border border-border bg-surface p-8 text-center">
          <h1 className="font-heading text-2xl text-foreground">Firebase Not Configured</h1>
          <p className="text-sm text-muted-light">
            The admin panel requires Firebase credentials. Copy{" "}
            <code className="rounded bg-surface-light px-1.5 py-0.5 text-laser-cyan">.env.local.example</code>{" "}
            to{" "}
            <code className="rounded bg-surface-light px-1.5 py-0.5 text-laser-cyan">.env.local</code>{" "}
            and fill in the <code className="rounded bg-surface-light px-1.5 py-0.5 text-laser-cyan">NEXT_PUBLIC_FIREBASE_*</code> values.
          </p>
          <p className="text-xs text-muted">Then restart the dev server.</p>
        </div>
      </div>
    );
  }

  // Login page renders without the admin shell
  if (isLoginPage) return <>{children}</>;

  // Not logged in and not on login page — show nothing while redirecting
  if (!user) return <LoadingSpinner message="Redirecting to login..." />;

  if (isRemovedAdminPath) return <LoadingSpinner message="Redirecting to dashboard..." />;

  // Logged in — render admin shell
  return <AdminShell>{children}</AdminShell>;
}
