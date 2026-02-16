import { Inter } from "next/font/google";
import "./globals.css"; 
import Script from "next/script";
import CookieConsent from '../components/CookieConsent';

// 1. FONT OPTIMIZATION
const inter = Inter({ subsets: ["latin"], display: 'swap' });

// 2. VIEWPORT (Mobile Locked)
export const viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// 3. MASTER METADATA
export const metadata = {
  metadataBase: new URL('https://cashttree.online'),

  title: {
    default: "CashTree | The Performance Reward Network",
    template: "%s | CashTree Network" 
  },
  description: "India's premier performance marketing network. Connect with top financial brands. Automated S2S tracking, instant UPI payouts, and enterprise-grade support.",
  keywords: ["affiliate network india", "cpa network", "performance marketing", "cashtree", "earning app", "instant withdrawal", "work from home"],
  authors: [{ name: "CashTree Network Team", url: "https://cashttree.online" }],
  creator: "CashTree Network",
  publisher: "CashTree Network",

  // Search Engine Bots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Canonical (Prevents Duplicate Content Issues)
  alternates: {
    canonical: '/',
  },

  // Social Media Previews (OpenGraph)
  openGraph: {
    type: "website",
    siteName: "CashTree Network",
    title: "CashTree | Monetize Your Traffic",
    description: "The #1 Performance Reward Network for Indian Creators. Instant Payouts. Verified Campaigns.",
    url: "https://cashttree.online/",
    locale: "en_IN",
    images: [{
      url: "/og-image.png", // Make sure this file exists in public/ folder!
      width: 1200,
      height: 630,
      alt: "CashTree Network Dashboard",
    }],
  },

  // Twitter/X Card
  twitter: {
    card: 'summary_large_image',
    title: 'CashTree | Monetize Your Traffic',
    description: 'Automated tracking and instant payouts for Indian publishers.',
    images: ['/og-image.png'],
    creator: '@CashTreeSupport',
  },

  // App Icons
  icons: {
    icon: "/logo.webp",
    apple: "/logo.webp", 
    shortcut: "/logo.webp",
  },
  manifest: "/manifest.json",

  // Verification Tags (Add codes here if DNS fails)
  verification: {
    google: 'YOUR_GOOGLE_CODE_HERE', // Optional (You used DNS)
    yandex: 'YOUR_YANDEX_CODE_HERE', 
    other: {
      'msvalidate.01': 'YOUR_BING_CODE_HERE',
      'impact-site-verification': '3db21adf-1799-49cc-850a-ee1371f30345',
    },
  },
};

export default function RootLayout({ children }) {
  // 4. RICH SCHEMA (Google "Organization" + "Support" Data)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CashTree Network",
    "url": "https://cashttree.online/",
    "logo": "https://cashttree.online/logo.webp",
    "description": "Performance marketing network connecting publishers with financial and gaming brands.",
    "sameAs": [
      "https://t.me/CashtTree_bot",
      "https://instagram.com/cashttree_official" 
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "help@cashttree.online",
      "contactType": "customer support",
      "areaServed": "IN",
      "availableLanguage": ["en", "hi"]
    }
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Security: Force HTTPS & Prevent XSS */}
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
      </head>
      
      <body className={`${inter.className} bg-black text-white antialiased selection:bg-[#00ff88] selection:text-black`}>
        
        {/* GOOGLE SCHEMA INJECTION */}
        <Script
          id="json-ld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* MAIN APP CONTENT */}
        {children}

        {/* LEGAL: COOKIE CONSENT BANNER */}
        <CookieConsent />
        
      </body>
    </html>
  );
}