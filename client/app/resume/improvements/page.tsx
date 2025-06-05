"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/useUserStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";

function ResponsiveToaster() {
  const [position, setPosition] = useState<any>("top-right");
  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 640) {
        setPosition("top");
      } else {
        setPosition("top-right");
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return <Toaster richColors position={position} />;
}

export default function ResumeImprovementsPage() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/auth");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-muted px-2">
      <Card className="w-full max-w-lg shadow-md border-none bg-white/90">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">
            Resume Improvements (Protected)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            This is a protected page. Only authenticated users can see this.
          </p>
        </CardContent>
      </Card>
      <ResponsiveToaster />
    </main>
  );
}
