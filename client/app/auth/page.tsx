"use client";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useUserStore } from "@/lib/useUserStore";

export default function AuthPage() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    if (user) {
      router.replace(redirect);
    }
  }, [user, router, redirect]);

  const handleGoogleSignIn = async () => {
    // ... existing code ...
    // After successful login:
    router.replace(redirect);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-muted px-2">
      <Card className="w-full max-w-md shadow-md border-none bg-white/90">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">
            Sign in to AlignCV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 mt-4">
            <GoogleSignInButton redirect={redirect} />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
