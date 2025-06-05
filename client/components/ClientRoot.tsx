"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/lib/useUserStore";

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useUserStore((state) => state.setUser);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
      }
    });
    // Optionally, you could clearUser if no user, but persistence handles logout
  }, [setUser]);
  return <>{children}</>;
}
