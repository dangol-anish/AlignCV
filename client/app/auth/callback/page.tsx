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
    supabase.auth.getSession().then(({ data }) => {
      const user = data?.session?.user;
      const token = data?.session?.access_token;
      if (user && token) {
        setUser({
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name || "",
          created_at: user.created_at || "",
          token,
        });
        const redirect = searchParams.get("redirect") || "/dashboard";
        router.push(redirect);
      }
    });
  }, [router, setUser]);

  return <div>Signing you in...</div>;
}
