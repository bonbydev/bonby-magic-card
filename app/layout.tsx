import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import ToastProvider from "@/components/toast-provider";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bonby Magic Card Game",
  description: "Game about flip card and receive rewards",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`font-sans antialiased`}>
        <ToastProvider />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
