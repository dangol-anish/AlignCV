"use client";
import { supabase } from "@/lib/supabaseClient";

export default function GoogleSignInButton() {
  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback",
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
