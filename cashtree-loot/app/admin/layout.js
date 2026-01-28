import { Inter } from "next/font/google";
import "./globals.css"; // ✅ Correct Path (One dot)
import Script from "next/script";

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
  description: "Discover VERIFIED refer & earn apps with instant UPI cashback on CashTree Loot. Trusted by Indian students for safe, no-investment earning guides.",
  keywords: ["cashtree loot", "refer and earn apps india", "verified earning apps", "instant upi cashback", "student earning without investment"],
  authors: [{ name: "CashTree Loot" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    siteName: "CashTree Loot",
    title: "CashTree Loot – Verified Refer & Earn",
    description: "Stop wasting time on fake earning apps. CashTree Loot lists only VERIFIED refer & earn and cashback offers.",
    url: "https://cashttree.online/",
    locale: "en_IN",
    images: [{
      url: "https://cashttree.online/og-image-large.png",
      width: 1200,
      height: 630,
      alt: "CashTree Loot – Verified Refer & Earn",
    }],
  },
  icons: {
    icon: "/logo.webp",
    apple: "/logo.webp",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CashTree Loot",
    "url": "https://cashttree.online/"
  };

  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
        <meta name="theme-color" content="#0b121a" />
      </head>
      <body className={inter.className}>
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