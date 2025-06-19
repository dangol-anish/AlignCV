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
          "fixed top-0 left-0 z-50 h-screen w-64 bg-stone-950 border-r border-stone-800 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between py-3 px-4">
            <h2 className="text-xl text-stone-100 font-light">
              Align<span className="text-blue-500  font-bold">CV</span>
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={close}
              className="text-blue-500 hover:text-blue-400 hover:bg-stone-950 cursor-pointer"
            >
              <PanelRightOpen className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 py-8 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-1.5 rounded-md transition-colors",
                  pathname === item.path
                    ? "bg-blue-500/10 text-blue-500"
                    : "text-stone-400 hover:text-blue-500 hover:bg-stone-900"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-stone-800">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata?.full_name || user.email}
                      className="h-8 w-8 rounded-full border border-stone-800"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 text-sm">
                      {(user.user_metadata?.full_name ||
                        user.email ||
                        "U")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm text-stone-100 font-light">
                      {user.user_metadata?.full_name || "User"}
                    </span>
                    <span className="text-xs text-stone-400 font-thin">
                      {user.email}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full  text-blue-500 hover:text-red-500 bg-stone-900/50 hover:bg-red-950/20 cursor-pointer transition-colors duration-200"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="flex items-center justify-center gap-2 px-3 py-1.5 text-sm text-stone-400 hover:text-blue-500 hover:bg-stone-900 rounded-md transition-colors"
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
