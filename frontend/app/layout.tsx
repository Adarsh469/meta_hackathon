import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MedicalBackground } from "@/components/MedicalBackground";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ClinicalTriage-Env | Emergency Department Triage Simulator",
  description:
    "An AI-powered Emergency Department triage simulator. Assign ESI levels, prioritize patient queues, and uncover hidden medical histories.",
  keywords: ["triage", "medical AI", "ESI", "emergency department"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#f5f8fa] text-slate-900 antialiased">
        <MedicalBackground />
        {children}
      </body>
    </html>
  );
}
