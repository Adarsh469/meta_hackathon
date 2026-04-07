import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ClinicalTriage-Env | Emergency Department Triage Simulator",
  description:
    "An OpenEnv AI-powered Emergency Department triage simulator. Assign ESI levels, prioritize patient queues, and uncover hidden medical histories.",
  keywords: ["triage", "medical AI", "ESI", "emergency department", "OpenEnv"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#080c14] text-white antialiased">{children}</body>
    </html>
  );
}
