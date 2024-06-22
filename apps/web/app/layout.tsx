import "./globals.css";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import localFont from "next/font/local";

import { cn } from "@/lib/utils";
import RootProviders from "./providers";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});
const calFont = localFont({
  src: "../fonts/CalSans-SemiBold.woff2",
  variable: "--font-cal",
  preload: true,
  display: "block",
  weight: "600",
});

export const metadata: Metadata = {
  title: "Welcome to Troop",
  description: "The events live here",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" className="">
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          fontSans.variable,
          calFont.variable,
        )}
      >
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
