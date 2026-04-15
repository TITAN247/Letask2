import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Script from "next/script";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://letask2.onrender.com"),
  title: {
    default: "LetAsk - Find Your Perfect Mentor",
    template: "%s | LetAsk"
  },
  description: "Connect with experienced mentors who've been there. Get career guidance, skill development, and personalized mentorship from professionals across industries.",
  keywords: ["mentorship", "career guidance", "professional mentoring", "skill development", "career coaching", "mentor matching", "personal development"],
  authors: [{ name: "LetAsk" }],
  creator: "LetAsk",
  publisher: "LetAsk",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://letask2.onrender.com",
    siteName: "LetAsk",
    title: "LetAsk - Find Your Perfect Mentor",
    description: "Connect with experienced mentors who've been there. Get career guidance and personalized mentorship.",
    images: [
      {
        url: "/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "LetAsk - Mentorship Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LetAsk - Find Your Perfect Mentor",
    description: "Connect with experienced mentors who've been there.",
    images: ["/assets/og-image.png"],
    creator: "@letask",
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://letask2.onrender.com",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX';

  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `}
        </Script>
      </head>
      <body
        className={`${outfit.variable} antialiased overflow-x-hidden`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
