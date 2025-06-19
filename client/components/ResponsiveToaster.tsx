"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

export default function ResponsiveToaster() {
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

  return (
    <Toaster
      richColors
      position={position}
      toastOptions={{
        style: {
          background: "linear-gradient(90deg, #0c0a09 0%, #0c0a09 100%)", // stone-950
          color: "#fff",
          border: "1px solid #3b82f6", // blue-500
          boxShadow: "0 2px 16px 0 rgba(59,130,246,0.10)",
        },
        className: "font-sans",
      }}
    />
  );
}
