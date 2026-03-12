"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Film,
  Package,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "./auth-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/portfolio", label: "Portfolio", icon: Film },
  { href: "/admin/rentals", label: "Rental Items", icon: Package },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSidebarOpen(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <div className="flex h-screen flex-col overflow-hidden md:flex-row">
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Back to website homepage"
            className="rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-laser-cyan/50"
          >
            <Image src="/logo-icon.png" alt="" width={28} height={24} className="h-6 w-auto" />
          </Link>
          <Link href="/admin" className="font-heading text-lg tracking-wide text-foreground">
            HBP Admin
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen((current) => !current)}
          className="rounded-md border border-border p-2 text-muted-light transition-colors hover:bg-surface-light hover:text-foreground"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={sidebarOpen}
          aria-controls="admin-sidebar"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-background/60 md:hidden"
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-56 shrink-0 flex-col border-r border-border bg-surface transition-transform duration-200 md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Back to website homepage" className="rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-laser-cyan/50">
              <Image src="/logo-icon.png" alt="" width={28} height={24} className="h-6 w-auto" />
            </Link>
            <Link href="/admin" className="font-heading text-lg tracking-wide text-foreground">
              HBP Admin
            </Link>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-laser-cyan/10 text-laser-cyan"
                        : "text-muted-light hover:bg-surface-light hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-3">
          <p className="mb-2 truncate text-xs text-muted">{user?.email}</p>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-light transition-colors hover:bg-surface-light hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
        {children}
      </div>
    </div>
  );
}
