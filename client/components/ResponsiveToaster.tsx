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

  return <Toaster richColors position={position} />;
}
