import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { clsx } from "clsx";
import BackgroundAnimation from "@/components/ui/BackgroundAnimation";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "InstaDownloader | Premium Media Tool",
  description: "Download Instagram Reels, Posts, and Stories in high quality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={clsx(inter.variable, "font-sans h-full bg-background text-foreground antialiased")}>
        <BackgroundAnimation />
        {children}
      </body>
    </html>
  );
}
