import React from "react";
import Link from "next/link";
import {
  FOOTER_BRAND,
  FOOTER_FEATURES,
  FOOTER_COPYRIGHT,
} from "@/constants/footer";

const Footer = () => {
  return (
    <footer className="">
      <div className="container mx-auto px-4">
        <div className="flex justify-between gap-12">
          {/* Brand Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-light text-stone-100">
              {FOOTER_BRAND.name.split(FOOTER_BRAND.highlight)[0]}
              <span className="text-blue-500">{FOOTER_BRAND.highlight}</span>
            </h3>
            <p className="text-stone-400 font-thin">{FOOTER_BRAND.motto}</p>
          </div>

          {/* Features Section */}
          <div className="flex flex-col gap-4">
            <h4 className="text-stone-100 font-light mb-2">Features</h4>
            <ul className="space-y-2">
              {FOOTER_FEATURES.map((feature) => (
                <li key={feature.name}>
                  <Link
                    href={feature.href}
                    className="text-stone-400 hover:text-blue-400 transition-colors duration-200 font-thin"
                  >
                    {feature.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-8 pt-4 border-t border-stone-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-stone-400 font-thin text-sm">
              {FOOTER_COPYRIGHT.text.replace(
                "{year}",
                new Date().getFullYear().toString()
              )}
            </p>
            <p className="text-stone-400 font-thin text-sm">
              Made with ❤️ by{" "}
              <a
                href={FOOTER_COPYRIGHT.maker.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                {FOOTER_COPYRIGHT.maker.name}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
