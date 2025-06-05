"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/lib/useUserStore";

export default function AuthCallback() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: any) => {
      setUser(data.user);
      if (data.user) {
        router.push("/dashboard");
      }
    });
  }, [router, setUser]);

  return <div>Signing you in...</div>;
}
