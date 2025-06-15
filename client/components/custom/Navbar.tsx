"use client";
import { navItems } from "@/app/constants/NavItems";
import Link from "next/link";
import React from "react";
import { useUserStore } from "@/lib/useUserStore";
import { supabase } from "@/lib/supabaseClient";
import { LogInIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
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
    <nav className="w-full flex items-center justify-between gap-2 text-[18px] text-zinc-500 h-20 bg-zinc-950 px-8">
      <h1 className="text-xl font-bold text-royal-blue tracking-wider">
        AlignCV
      </h1>

      <ul className="flex space-x-6">
        {navItems.map((item, index) => (
          <li key={index}>
            <Link
              href={item.path}
              className="tracking-wider hover:text-blue-400 text-lg"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      {user ? (
        <div className="flex items-center gap-4 ">
          <span className="text-[16px] bg-royal-blue  text-zinc-100 px-2 py-1 rounded-md tracking-wider">
            Dashboard
          </span>
          {/* <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-sm font-medium transition-colors"
          >
            Log out
          </button> */}
        </div>
      ) : (
        <Link
          href="/auth"
          className="text-white text-lg font-semibold flex items-center gap-2 hover:bg-slate-700 px-2 py-1  rounded-md transition-colors"
        >
          <LogInIcon className="w-4 h-4" />
          <p className="text-lg">Login</p>
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
