"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/lib/useUserStore";

export default function Dashboard() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      supabase.auth.getUser().then(({ data }) => {
        setUser(data.user);
        if (!data.user) {
          router.replace("/");
        }
      });
    }
  }, [user, setUser, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearUser();
    router.replace("/");
  };

  if (!user) {
    return <div className="p-8">Loading user info...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div>
        <p>Welcome, {user.email}!</p>
        <pre>{JSON.stringify(user, null, 2)}</pre>
        <button
          className="mt-4 px-4 py-2 bg-gray-800 text-white rounded"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
