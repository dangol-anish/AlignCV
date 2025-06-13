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
  const clearUser = useUserStore((state) => state.clearUser);
  const setAuthLoading = useUserStore((state) => state.setAuthLoading);

  useEffect(() => {
    setAuthLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name || "",
          created_at: session.user.created_at,
          token: session.access_token,
        });
      } else {
        clearUser();
      }
      setAuthLoading(false);
    });
  }, [setUser, clearUser, setAuthLoading]);

  return <>{children}</>;
}
