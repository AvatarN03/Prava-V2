import type { Metadata } from "next";
import { Newsreader, Sora } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import { ThemeProvider } from "@/provider/ThemeProvider";

import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Prava — Workspace-First Travel OS",
    template: "%s | Prava",
  },
  description:
    "Intelligent trip planning without the chaos. Organize multi-day itineraries, stays, expenses, and travel essentials in a structured workspace.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${newsreader.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
