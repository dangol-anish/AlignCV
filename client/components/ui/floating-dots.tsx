"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function FloatingDots() {
  const [isGlowing, setIsGlowing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlowing((prev) => !prev);
    }, 3000); // Toggle every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const dots = [
    {
      position: "absolute top-[10%] left-[10%]",
      delay: "delay-0",
      size: "h-3 w-3", // Smaller dot
    },
    {
      position: "absolute top-[15%] right-[15%]",
      delay: "delay-300",
      size: "h-2 w-2", // Even smaller dot
    },
  ];

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
      {dots.map((dot, index) => (
        <div
          key={index}
          className={cn(
            "rounded-full transition-all duration-1000 ease-in-out",
            dot.position,
            dot.delay,
            dot.size,
            isGlowing
              ? "bg-blue-500/70 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              : "bg-blue-500/30 shadow-none"
          )}
        />
      ))}
    </div>
  );
}
