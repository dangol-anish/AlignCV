"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/lib/useUserStore";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const user = session.user;
        const token = session.access_token;

        if (user && token) {
          setUser({
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.name || "",
            created_at: user.created_at || "",
            token,
          });
        }

        const redirect = searchParams.get("redirect") || "/dashboard";
        router.replace(redirect);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, searchParams, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Signing you in...</h2>
        <p className="text-muted-foreground">
          Please wait while we complete the sign-in process.
        </p>
      </div>
    </div>
  );
}
