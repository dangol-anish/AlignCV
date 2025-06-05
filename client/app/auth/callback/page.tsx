"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/lib/useUserStore";

export default function AuthCallback() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const searchParams = useSearchParams();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: any) => {
      setUser(data.user);
      if (data.user) {
        const redirect = searchParams.get("redirect") || "/dashboard";
        router.push(redirect);
      }
    });
  }, [router, setUser]);

  return <div>Signing you in...</div>;
}
