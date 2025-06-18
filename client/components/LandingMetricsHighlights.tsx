import React from "react";
import { LandingMetricsItem } from "@/constants/LandingMetricsItems";

const LandingMetricsHighlights = () => {
  return (
    <section>
      <div className="flex flex-col justify-center items-center mb-12">
        <h2 className="text-4xl text-stone-100 mb-4 font-light">
          Why Align<span className="text-blue-500">CV</span> Works
        </h2>
        <p className="text-stone-400 text-lg font-thin">Built For Results</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {LandingMetricsItem.map((metric) => (
          <div
            key={metric.id}
            className="flex flex-col items-center text-center gap-1"
          >
            <span className="text-4xl bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent mb-2">
              {metric.highlightMetric}
            </span>
            <span className="text-stone-400 uppercase text-sm font-light tracking-wider">
              {metric.text}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LandingMetricsHighlights;
