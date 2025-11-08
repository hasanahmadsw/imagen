import { Geist } from "next/font/google";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import "./globals.css";


const GeistSans = Geist({ subsets: ["latin"] });

export const metadata = {
  title: "AI SDK Google Image Analysis",
  description:
    "Analyze images using Google's Gemini 2.5 Flash Image Preview model",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html className="h-full" lang="en">
      <body className={cn("h-full bg-muted font-geist", GeistSans.className)}>
        {children}
      </body>
    </html>
  );
}
