"use client";

import React from "react";
import { Sidebar } from "../ui/sidebar";
import { Button } from "../ui/button";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useUserStore } from "@/lib/useUserStore";
import { useSidebarStore } from "@/lib/useSidebarStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const user = useUserStore((state) => state.user);
  const { isOpen, toggle } = useSidebarStore();
  const pathname = usePathname();

  const navItems = [
    { label: "Resume Analysis", path: "/resume-analysis" },
    { label: "Job Match", path: "/job-match" },
    { label: "Cover Letter", path: "/cover-letter" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950 border-b border-zinc-800">
        <div className="relative">
          {/* Sidebar Toggle Button - Leftmost */}
          {user && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggle}
                className="text-blue-500 hover:text-blue-400 border-zinc-800"
              >
                {isOpen ? (
                  <PanelRightClose className="h-5 w-5" />
                ) : (
                  <PanelRightOpen className="h-5 w-5" />
                )}
              </Button>
            </div>
          )}

          {/* Main Nav Content - 60% width */}
          <div className="w-[60%] mx-auto">
            <div className="flex items-center justify-between h-16 px-4">
              {/* Left side - Logo */}
              <div className="flex items-center">
                <h2 className="text-xl font-bold text-blue-500">AlignCV</h2>
              </div>

              {/* Center - Navigation Links */}
              <div className="hidden md:flex items-center space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "text-sm text-zinc-400 hover:text-blue-500 transition-colors",
                      pathname === item.path && "text-blue-500"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Right side - Auth Button */}
              <div>
                {user ? (
                  <Link href="/dashboard">
                    <Button
                      variant="outline"
                      className="text-blue-500 hover:text-blue-400 border-zinc-800"
                    >
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth">
                    <Button
                      variant="outline"
                      className="text-blue-500 hover:text-blue-400 border-zinc-800"
                    >
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      {user && <Sidebar />}

      {/* Main Content */}
      <main className="min-h-screen pt-16">
        <div className="w-[60%] mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  );
};
