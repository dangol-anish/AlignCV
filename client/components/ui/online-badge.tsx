"use client";

import { Badge } from "./badge";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function OnlineBadge() {
  const [isGlowing, setIsGlowing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlowing((prev) => !prev);
    }, 3000); // Increased to 3 seconds for smoother transition

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center">
      <Badge
        variant="outline"
        className="flex items-center gap-2 border-zinc-800 w-fit"
      >
        <div
          className={cn(
            "h-2 w-2 rounded-full transition-all duration-1000 ease-in-out",
            isGlowing
              ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              : "bg-green-500/30 shadow-none"
          )}
        />
        <span className="text-sm text-zinc-400">AI Powered</span>
      </Badge>
    </div>
  );
}
