import { Inter } from "next/font/google";
import "../globals.css";
import Script from "next/script";

// Load the Inter font (matches your old site's font-family)
const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  themeColor: "#0b121a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata = {
  title: "CashTree Loot – Verified Refer & Earn with Instant UPI Cashback (India)",
  description: "Discover VERIFIED refer & earn apps with instant UPI cashback on CashTree Loot. Trusted by Indian students for safe, no-investment earning guides. Zero fake apps.",
  keywords: ["cashtree loot", "refer and earn apps india", "verified earning apps", "instant upi cashback", "student earning without investment", "legit money earning apps"],
  authors: [{ name: "CashTree Loot" }],
  publisher: "CashTree Loot",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://cashttree.online/",
    languages: {
      "en-IN": "https://cashttree.online/",
      "x-default": "https://cashttree.online/",
    },
  },
  openGraph: {
    type: "website",
    siteName: "CashTree Loot",
    title: "CashTree Loot – Verified Refer & Earn with UPI Cashback",
    description: "Stop wasting time on fake earning apps. CashTree Loot lists only VERIFIED refer & earn and cashback offers for Indian users.",
    url: "https://cashttree.online/",
    locale: "en_IN",
    images: [
      {
        url: "https://cashttree.online/og-image-large.png", // Ensure this image is in your public folder
        width: 1200,
        height: 630,
        alt: "CashTree Loot – Verified Refer & Earn and Cashback Offers in India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CashTree Loot – Verified Refer & Earn with Cashback",
    description: "Discover verified cashback and refer & earn apps. No investment. Real campaigns only.",
    images: ["https://cashttree.online/twitter-card-large.png"], // Ensure this image is in public folder
  },
  icons: {
    icon: "/logo.webp",
    apple: "/logo.webp", // Using logo.webp as the apple touch icon based on your HTML
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  // Your Structured Data (JSON-LD)
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "CashTree Loot",
      "url": "https://cashttree.online/",
      "logo": "https://cashttree.online/logo.png",
      "description": "CashTree Loot curates verified refer & earn apps, cashback offers, and earning guides for Indian users.",
      "sameAs": [
        "https://t.me/CashtTree_bot"
      ]
    },
    {
      "@type": "WebSite",
      "name": "CashTree Loot",
      "url": "https://cashttree.online/",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://cashttree.online/?s={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ];

  return (
    <html lang="en">
      <head>
        {/* Security Policy (CSP) from your old HTML */}
        <meta httpEquiv="Content-Security-Policy" content="
          default-src 'self';
          script-src 'self' 'unsafe-eval' 'unsafe-inline' https://nap5k.com https://rzp.io https://cdn.jsdelivr.net https://*.telegram.org https://*.t.me;
          style-src 'self' 'unsafe-inline' https:;
          img-src 'self' data: https:;
          font-src 'self' https:;
          connect-src 'self' https:;
          frame-src https://rzp.io https://*.telegram.org;
          object-src 'none';
          base-uri 'self';
          upgrade-insecure-requests;
        " />
        <meta name="theme-color" content="#0b121a" />
      </head>
      <body className={inter.className}>
        {/* Inject JSON-LD Schema */}
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {children}
      </body>
    </html>
  );
}