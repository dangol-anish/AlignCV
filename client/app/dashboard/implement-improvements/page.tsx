import React, { useEffect } from "react";
import { useUserStore } from "@/lib/useUserStore";
import { useRouter } from "next/navigation";

export default function ImplementImprovementsPage() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const authLoading = useUserStore((state) => state.authLoading);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin?redirect=/dashboard/implement-improvements");
    }
  }, [authLoading, user, router]);

  if (authLoading) return <div>Loading...</div>;
  if (!user) return null;
  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Implement Improvements</h1>
      <p className="text-lg">
        This is a protected page. You must be signed in to access it.
      </p>
    </div>
  );
}
