"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { useUserStore } from "@/lib/useUserStore";
import { useSidebarStore } from "@/lib/useSidebarStore";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const user = useUserStore((state) => state.user);

  // Redirect signed-in users to /dashboard
  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("[SIGNUP] Sending:", { name, email, password });
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    console.log("[SIGNUP] Response status:", res.status);
    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }
    console.log("[SIGNUP] Response data:", data);
    if (res.ok) {
      toast({
        title: "Sign up successful!",
        description: "You can now sign in.",
      });
      // Close sidebar after sign up
      if (typeof window !== "undefined") {
        const sidebarStore = require("@/lib/useSidebarStore");
        sidebarStore.useSidebarStore.getState().close();
      }
      router.replace("/auth/signin");
    } else {
      if (
        data &&
        data.message ===
          "This email is already registered. Please sign in with Google."
      ) {
        toast({
          title: "Email already registered",
          description: data.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign up failed",
          description: (data && data.message) || "Sign up failed",
          variant: "destructive",
        });
      }
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <main className="flex flex-col flex-grow items-center justify-center min-h-[calc(100vh-8rem)] bg-stone-950">
      <Card className="w-full max-w-md shadow-lg border border-stone-800 bg-stone-900 text-stone-100">
        <CardHeader className="pb-5">
          <CardTitle className="text-center text-2xl font-bold tracking-tight text-stone-100">
            Create your account
          </CardTitle>
          <p className="text-center text-stone-400 text-sm font-light tracking-wide mt-1">
            Sign up for AlignCV
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-stone-800 border-stone-700 text-stone-100 placeholder:text-stone-400 focus:border-blue-500 focus:ring-blue-500"
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-stone-800 border-stone-700 text-stone-100 placeholder:text-stone-400 focus:border-blue-500 focus:ring-blue-500"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-stone-800 border-stone-700 text-stone-100 placeholder:text-stone-400 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-md shadow-md transition-all duration-200 transform hover:from-blue-700 hover:to-blue-500 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Signing Up...
                </span>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent" />
            <span className="mx-3 text-xs text-stone-500 uppercase tracking-widest">
              or
            </span>
            <div className="flex-grow h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent" />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-stone-700 text-stone-100 hover:text-stone-100 hover:bg-stone-800 cursor-pointer"
            onClick={() => {
              let redirectTo = window.location.origin + "/auth/callback";
              const redirect = "/dashboard";
              if (redirect) {
                const encoded = encodeURIComponent(redirect);
                redirectTo += `?redirect=${encoded}`;
              }
              // Use supabase directly for Google sign in for consistent styling
              const { supabase } = require("@/lib/supabaseClient");
              supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo },
              });
            }}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_17_40)">
                <path
                  d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29.1H37.4C36.7 32.2 34.7 34.7 31.8 36.4V42.1H39.3C44 38 47.5 31.9 47.5 24.5Z"
                  fill="#4285F4"
                />
                <path
                  d="M24 48C30.6 48 36.1 45.8 39.3 42.1L31.8 36.4C30.1 37.5 27.9 38.3 24 38.3C17.7 38.3 12.2 34.2 10.3 28.7H2.5V34.6C5.7 41.1 14.1 48 24 48Z"
                  fill="#34A853"
                />
                <path
                  d="M10.3 28.7C9.8 27.6 9.5 26.4 9.5 25.1C9.5 23.8 9.8 22.6 10.3 21.5V15.6H2.5C0.8 18.7 0 22.2 0 25.1C0 28 0.8 31.5 2.5 34.6L10.3 28.7Z"
                  fill="#FBBC05"
                />
                <path
                  d="M24 9.7C27.6 9.7 30.1 11.2 31.4 12.3L39.4 5.1C36.1 2.1 30.6 0 24 0C14.1 0 5.7 6.9 2.5 15.6L10.3 21.5C12.2 16 17.7 9.7 24 9.7Z"
                  fill="#EA4335"
                />
              </g>
              <defs>
                <clipPath id="clip0_17_40">
                  <rect width="48" height="48" fill="white" />
                </clipPath>
              </defs>
            </svg>
            Sign up with Google
          </Button>
          <div className="mt-6 text-center text-sm text-stone-400">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-blue-400 hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
