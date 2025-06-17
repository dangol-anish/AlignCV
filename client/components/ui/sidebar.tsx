"use client";

import React from "react";
import { navItems } from "@/constants/NavItems";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useUserStore } from "@/lib/useUserStore";
import { useSidebarStore } from "@/lib/useSidebarStore";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const { isOpen, close } = useSidebarStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      clearUser();
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={close} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-zinc-950 border-r border-zinc-800 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <h2 className="text-xl font-bold text-blue-500">AlignCV</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={close}
              className="text-blue-500 hover:text-blue-400"
            >
              <PanelRightOpen className="h-6 w-6" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
                  pathname === item.path
                    ? "bg-blue-500/10 text-blue-500"
                    : "text-zinc-400 hover:text-blue-500 hover:bg-zinc-900"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-zinc-800">
            {user ? (
              <div className="space-y-2">
                <div className="text-sm text-zinc-400">
                  Signed in as {user.email}
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full text-zinc-400 hover:text-blue-500"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-blue-500 hover:bg-zinc-900 rounded-md transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
