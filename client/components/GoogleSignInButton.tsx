"use client";
import { supabase } from "@/lib/supabaseClient";

export default function GoogleSignInButton({
  redirect,
}: {
  redirect?: string;
}) {
  const handleGoogleSignIn = async () => {
    let redirectTo = window.location.origin + "/auth/callback";
    if (redirect) {
      const encoded = encodeURIComponent(redirect);
      redirectTo += `?redirect=${encoded}`;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
  };

  return (
    <button
      className="px-4 py-2 bg-red-600 text-white rounded"
      onClick={handleGoogleSignIn}
    >
      Sign in with Google
    </button>
  );
}
