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

// Use a single source of truth for the site URL so metadata, Open Graph, and
// structured data all agree. You can override this via NEXT_PUBLIC_SITE_URL.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bonby-magic-card.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bonby Magic Card Game",
    template: "%s | Bonby Magic Card Game",
  },
  description:
    "Bonby Magic Card is an online flip-card game where you build collections, play daily, and unlock surprise rewards.",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  keywords: [
    "Bonby",
    "magic card game",
    "flip card game",
    "online card game",
    "reward game",
    "browser game",
  ],
  openGraph: {
    type: "website",
    url: "/",
    title: "Bonby Magic Card Game",
    description:
      "Flip cards, build collections, and win rewards with Bonby Magic Card.",
    siteName: "Bonby Magic Card",
    images: [
      {
        url: "/images/logo.webp",
        width: 512,
        height: 512,
        alt: "Bonby Magic Card logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bonby Magic Card Game",
    description:
      "Play the Bonby Magic Card game online. Flip cards and discover rewards.",
    images: ["/images/logo.webp"],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
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
