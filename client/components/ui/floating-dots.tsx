"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Dot {
  id: number;
  size: number;
  x: number;
  y: number;
  delay: number;
}

const FloatingDots: React.FC = () => {
  const [isGlowing, setIsGlowing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlowing((prev) => !prev);
    }, 3000); // Toggle every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Fixed positions for dots
  const dots: Dot[] = [
    { id: 1, size: 3, x: 10, y: 15, delay: 0 },
    { id: 2, size: 2, x: 85, y: 20, delay: 0.5 },
    { id: 3, size: 4, x: 25, y: 45, delay: 1 },
    { id: 4, size: 2.5, x: 75, y: 50, delay: 1.5 },
    { id: 5, size: 3.5, x: 15, y: 75, delay: 0.8 },
    { id: 6, size: 2, x: 90, y: 80, delay: 1.2 },
    { id: 7, size: 3, x: 50, y: 30, delay: 0.3 },
    { id: 8, size: 2.5, x: 40, y: 60, delay: 0.7 },
    { id: 9, size: 2, x: 35, y: 25, delay: 0.4 },
    { id: 10, size: 3, x: 65, y: 35, delay: 0.9 },
    { id: 11, size: 2.5, x: 20, y: 55, delay: 1.1 },
    { id: 12, size: 3, x: 80, y: 65, delay: 0.6 },
    { id: 13, size: 2, x: 45, y: 85, delay: 1.3 },
    { id: 14, size: 3.5, x: 55, y: 15, delay: 0.2 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {dots.map((dot) => (
        <div
          key={dot.id}
          className={cn(
            "absolute rounded-full bg-blue-500/20 animate-pulse",
            isGlowing ? "shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "shadow-none"
          )}
          style={{
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            animationDelay: `${dot.delay}s`,
            boxShadow: `0 0 ${dot.size * 2}px ${
              dot.size
            }px rgba(59, 130, 246, 0.1)`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingDots;
