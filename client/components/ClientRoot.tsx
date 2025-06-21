"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/lib/useUserStore";
import { ToastProvider } from "@/components/ui/use-toast";
import ResponsiveToaster from "@/components/ResponsiveToaster";

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

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && session.access_token) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            user_metadata: session.user.user_metadata,
            created_at: session.user.created_at,
            token: session.access_token,
          });
          console.log("[CLIENTROOT] User set in store:", session.user);
        } else {
          // Try to refresh session if missing
          const { data: refreshed, error } =
            await supabase.auth.refreshSession();
          if (refreshed.session?.user && refreshed.session.access_token) {
            setUser({
              id: refreshed.session.user.id,
              email: refreshed.session.user.email || "",
              user_metadata: refreshed.session.user.user_metadata,
              created_at: refreshed.session.user.created_at,
              token: refreshed.session.access_token,
            });
            console.log(
              "[CLIENTROOT] User set from refreshSession:",
              refreshed.session.user
            );
          } else {
            clearUser();
            console.log("[CLIENTROOT] User cleared from store (no session)");
          }
        }
      } catch (error) {
        console.error("[CLIENTROOT] Auth initialization error:", error);
        clearUser();
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();

    // Listen for session changes and update token in store
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user && session.access_token) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            user_metadata: session.user.user_metadata,
            created_at: session.user.created_at,
            token: session.access_token,
          });
          console.log(
            "[CLIENTROOT] User updated from onAuthStateChange:",
            session.user
          );
        } else {
          clearUser();
          console.log("[CLIENTROOT] User cleared from onAuthStateChange");
        }
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [setUser, clearUser, setAuthLoading]);

  return (
    <ToastProvider>
      <ResponsiveToaster />
      {children}
    </ToastProvider>
  );
}
