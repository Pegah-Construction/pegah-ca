import type { Metadata } from "next";
import { Archivo, Source_Sans_3, Space_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

const display = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pegah Construction Ltd. — Building Ontario since 1988",
  description:
    "An established general contracting and project-management firm serving Ontario across commercial, industrial, institutional and residential sectors since 1988.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="flex min-h-screen flex-col"><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
