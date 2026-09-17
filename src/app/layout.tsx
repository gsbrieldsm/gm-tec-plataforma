import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import React from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const univia = localFont({
  src: [
    { path: "../fonts/UniviaPro-Book.ttf",       weight: "400", style: "normal" },
    { path: "../fonts/UniviaPro-BookItalic.ttf", weight: "400", style: "italic" },
  ],
  variable: "--font-univia",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GM & Co Tec",
  description: "Plataforma de e-commerce multi-canal — relatórios, pedidos, pagamentos e integrações em um só lugar",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${univia.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
