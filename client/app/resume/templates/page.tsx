"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/useUserStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ResumeTemplatesPage() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/auth?redirect=/resume/templates");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-muted px-2">
      <Card className="w-full max-w-2xl shadow-md border-none bg-white/90">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">
            Choose a Resume Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div className="flex flex-col items-center p-4 border rounded bg-gray-50">
              <div className="w-24 h-32 bg-gray-200 mb-2 rounded" />
              <span className="font-semibold">Modern</span>
              <Button className="mt-2 w-full" disabled>
                Select
              </Button>
            </div>
            <div className="flex flex-col items-center p-4 border rounded bg-gray-50">
              <div className="w-24 h-32 bg-gray-200 mb-2 rounded" />
              <span className="font-semibold">Classic</span>
              <Button className="mt-2 w-full" disabled>
                Select
              </Button>
            </div>
          </div>
          <p className="text-center text-muted-foreground mt-6">
            (Template selection coming soon)
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
