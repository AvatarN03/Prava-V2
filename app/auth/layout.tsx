import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In or Sign Up",
  description:
    "Access your Prava travel workspace. Plan multi-day itineraries, organize stays, track expenses, and explore with structured AI assistance.",
  openGraph: {
    title: "Sign In or Sign Up | Prava — Travel Workspace",
    description:
      "Access your Prava travel workspace. Plan multi-day itineraries, organize stays, track expenses, and explore with structured AI assistance.",
    url: "/auth",
    siteName: "Prava",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Prava Travel Workspace",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sign In or Sign Up | Prava — Travel Workspace",
    description:
      "Access your Prava travel workspace. Plan multi-day itineraries, organize stays, track expenses, and explore with structured AI assistance.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/auth",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
