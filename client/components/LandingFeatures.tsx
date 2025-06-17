import React from "react";
import { LandingFeaturesItem } from "@/constants/LandingFeatureItems";

const LandingFeatures = () => {
  return (
    <section className=" ">
      <div className="flex flex-col justify-center items-center mb-12">
        <h2 className="text-5xl  text-stone-100 mb-4 font-light">
          Everything you need
        </h2>
        <p className="text-stone-400 text-lg font-thin">
          Comprehensive tools to optimize your job search process
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {LandingFeaturesItem.map((feature) => (
          <div
            key={feature.id}
            className="bg-stone-900/50 p-6 rounded-2xl border border-stone-800 transition-colors duration-200 hover:border-blue-900/50"
          >
            <div className="w-fit p-4 rounded-2xl border border-blue-900/50 bg-blue-900/30 mb-5">
              <feature.icon className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-stone-100 mb-2">
              {feature.heading}
            </h3>
            <p className="text-stone-400 mb-2 text">{feature.subHeading}</p>
            <p className="text-stone-600 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LandingFeatures;
