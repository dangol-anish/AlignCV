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

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-muted px-2">
      <Card className="w-full max-w-md shadow-md border-none bg-white/90">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">
            Sign up for AlignCV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </form>
          <div className="flex flex-col items-center gap-6 mt-4">
            <GoogleSignInButton redirect="/dashboard" />
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
