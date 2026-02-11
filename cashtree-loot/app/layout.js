import { Inter } from "next/font/google";
import "./globals.css"; 
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
  // 1. BASE URL (Critical for SEO & Social Images)
  metadataBase: new URL('https://cashttree.online'),

  title: {
    default: "CashTree Loot – Verified Refer & Earn with Instant UPI Cashback (India)",
    template: "%s | CashTree Loot" // Makes inner pages look cool (e.g., "Login | CashTree Loot")
  },
  description: "Discover VERIFIED refer & earn apps with instant UPI cashback on CashTree Loot. Trusted by Indian students for safe, no-investment earning guides.",
  keywords: ["cashtree loot", "refer and earn apps india", "verified earning apps", "instant upi cashback", "student earning without investment"],
  authors: [{ name: "CashTree Loot" }],
  
  // 2. SEARCH ENGINE SETTINGS
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // 3. CANONICAL URL (Prevents duplicate content issues)
  alternates: {
    canonical: '/',
  },

  // 4. FACEBOOK / WHATSAPP / LINKEDIN
  openGraph: {
    type: "website",
    siteName: "CashTree Loot",
    title: "CashTree Loot – Verified Refer & Earn",
    description: "Stop wasting time on fake earning apps. CashTree Loot lists only VERIFIED refer & earn and cashback offers.",
    url: "https://cashttree.online/",
    locale: "en_IN",
    images: [{
      url: "/og-image-large.png", // Next.js auto-resolves this using metadataBase
      width: 1200,
      height: 630,
      alt: "CashTree Loot – Verified Refer & Earn",
    }],
  },

  // 5. TWITTER CARD (Crucial for Twitter sharing)
  twitter: {
    card: 'summary_large_image',
    title: 'CashTree Loot – Verified Refer & Earn',
    description: 'Stop wasting time on fake earning apps. CashTree Loot lists only VERIFIED refer & earn and cashback offers.',
    images: ['/og-image-large.png'],
  },

  // 6. APP ICONS & MANIFEST
  icons: {
    icon: "/logo.webp",
    apple: "/logo.webp",
    shortcut: "/logo.webp",
  },
  manifest: "/manifest.json",
  
  // 7. APPLE WEB APP (Makes it feel like a Native App on iPhone)
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CashTree Loot',
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CashTree Loot",
    "url": "https://cashttree.online/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://cashttree.online/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <head>
        {/* Security Upgrade for HTTPS */}
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />

        {/* Impact.com Verification */}
        <meta name='impact-site-verification' value='2739c843-179e-4919-965a-85d6422484eb'></meta>

      </head>
      <body className={inter.className}>
        
        {/* GOOGLE SCHEMA (JSON-LD) */}
        <Script
          id="json-ld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {children}
      </body>
    </html>
  );
}