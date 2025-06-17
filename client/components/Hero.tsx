"use client";

import { OnlineBadge } from "@/components/ui/online-badge";

export default function Hero() {
  return (
    <div className="text-center flex flex-col gap-10">
      <OnlineBadge />
      <div className="flex flex-col gap-2">
        <h1 className="text-white text-5xl md:text-6xl lg:text-7xl font-light">
          Align
        </h1>
        <p className="text-6xl md:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-400 to-blue-300 lg:font-semibold">
          Your CV
        </p>

        <p className="text-3xl md:text-4xl lg:text-5xl text-stone-400 lg:font-thin mt-2">
          With Your Goals
        </p>
      </div>
      <p className="text-stone-100 text-center text-xl font-thin">
        Get instant AI-powered feedback on your resume, match with perfect jobs,
        and generate tailored cover letters.
      </p>
    </div>
  );
}
