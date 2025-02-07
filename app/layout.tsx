import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import "@/app/globals.css"; // Ensure correct path

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scribe",
  description: "AI-powered writing assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
