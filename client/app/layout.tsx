import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ClientRoot from "@/components/ClientRoot";
import { ClientLayout } from "@/components/layout/ClientLayout";

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AlignCV",
  description: "AI-Powered CV Analysis and Optimization",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geistSans.className}>
      <body>
        <ClientRoot>
          <ClientLayout>{children}</ClientLayout>
        </ClientRoot>
      </body>
    </html>
  );
}
