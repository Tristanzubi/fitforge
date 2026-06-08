import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FitForge — Préparation Rugby",
  description: "Préparation physique intelligente 10 semaines",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full antialiased dark`}>
      <body className="min-h-full bg-zinc-950 text-zinc-100 pb-16">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
