import React from "react";
import { Button } from "./ui/button";

const CTAHeroSection = () => {
  const handleScrollToUpload = () => {
    const uploadSection = document.getElementById("upload-section");
    if (uploadSection) {
      const yOffset = -200; // Increased from -100 to -200 to scroll higher
      const y =
        uploadSection.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center mb-12">
        <h2 className="text-5xl text-stone-100 mb-4 font-light">
          Ready to Align?
        </h2>
        <p className="text-stone-400 text-lg font-thin">
          Start optimizing your resume today. No signup required for your first
          analysis.
        </p>

        <Button
          onClick={handleScrollToUpload}
          className="mt-8 px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white font-medium rounded-xl transition-all duration-200 cursor-pointer"
        >
          Analyze my resume
        </Button>
      </div>
    </>
  );
};

export default CTAHeroSection;
