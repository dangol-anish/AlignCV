import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientRoot from "@/components/ClientRoot";
import { ClientLayout } from "@/components/layout/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AlignCV",
  description: "AI-powered career companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <ClientRoot>
          <ClientLayout>{children}</ClientLayout>
        </ClientRoot>
      </body>
    </html>
  );
}
