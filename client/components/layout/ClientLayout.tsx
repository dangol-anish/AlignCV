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
import { LogIn } from "lucide-react";

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
    <div className="min-h-screen bg-stone-950">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-950 border-b-[0.2px] border-stone-800">
        <div className="relative">
          {/* Sidebar Toggle Button - Leftmost */}
          {user && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                className="text-blue-500 cursor-pointer hover:text-blue-400 border-stone-800 hover:bg-stone-950"
              >
                {isOpen ? (
                  <PanelRightOpen className="h-5 w-5" />
                ) : (
                  <PanelRightClose className="h-5 w-5" />
                )}
              </Button>
            </div>
          )}

          {/* Main Nav Content - Responsive width */}
          <div className="w-[95%] md:w-[75%] lg:w-[60%] mx-auto">
            <div className="flex items-center justify-between h-16 px-4">
              {/* Left side - Logo */}
              <div className="flex-1 md:flex-none flex justify-center md:justify-start">
                <Link href="/" className="text-xl font-bold text-blue-500 flex">
                  <p className="text-stone-100 font-light">Align</p>
                  <p>CV</p>
                </Link>
              </div>

              {/* Center - Navigation Links (hidden on mobile) */}
              <div className="hidden md:flex items-center space-x-4 flex-1 justify-center">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "text-sm text-stone-400 hover:text-blue-500 transition-colors",
                      pathname === item.path && "text-blue-500"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Right side - Auth Button */}
              <div className="flex-1 md:flex-none flex justify-end">
                {user ? (
                  <Link href="/dashboard">
                    <Button
                      size="sm"
                      className="cursor-pointer text-sm font-light tracking-wide bg-gradient-to-r from-blue-500 to-blue-600 text-stone-100 border border-blue-400/50 hover:from-blue-600 hover:to-blue-700 hover:border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 px-4 py-1.5"
                    >
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm font-light tracking-wide text-blue-500 cursor-pointer flex gap-2 hover:text-stone-100 hover:bg-stone-950 px-4 py-1.5"
                    >
                      <p>Sign In</p> <LogIn size={16} />
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
        <div className="w-[95%] md:w-[75%] lg:w-[60%] mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};
