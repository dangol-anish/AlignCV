"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/lib/useUserStore";
import { ToastProvider } from "@/components/ui/use-toast";

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
          user_metadata: session.user.user_metadata,
          created_at: session.user.created_at,
          token: session.access_token,
        });
        console.log("[CLIENTROOT] User set in store:", session.user);
      } else {
        clearUser();
        console.log("[CLIENTROOT] User cleared from store");
      }
      setAuthLoading(false);
    });
  }, [setUser, clearUser, setAuthLoading]);

  return <ToastProvider>{children}</ToastProvider>;
}
