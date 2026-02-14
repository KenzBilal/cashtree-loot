import { Inter } from "next/font/google";
import "./globals.css"; 
import Script from "next/script";

// 1. FONT OPTIMIZATION (Google Inter)
const inter = Inter({ subsets: ["latin"] });

// 2. VIEWPORT SETTINGS (Mobile Optimized)
export const viewport = {
  themeColor: "#050505", // Matches your new dark theme background
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevents zooming issues on inputs
  userScalable: false,
};

// 3. SEO & METADATA (The "Tier-1" Professional Look)
export const metadata = {
  metadataBase: new URL('https://cashttree.online'),

  title: {
    default: "CashTree | The Performance Reward Network",
    template: "%s | CashTree Network" 
  },
  description: "India's verified performance marketing network. Connect with top financial & gaming brands. Automated S2S tracking, instant UPI payouts, and premium support for creators.",
  keywords: ["affiliate network india", "cpa network", "performance marketing", "cashtree", "refer and earn", "instant upi withdrawal", "student earning"],
  authors: [{ name: "CashTree Network" }],
  
  // Search Engine Behavior
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

  // Canonical URL
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
      url: "/og-image.png", 
      width: 1200,
      height: 630,
      alt: "CashTree Network Preview",
    }],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'CashTree | Monetize Your Traffic',
    description: 'Automated tracking and instant payouts for Indian publishers.',
    images: ['/og-image.png'],
  },

  // App Icons
  icons: {
    icon: "/logo.webp",
    apple: "/logo.webp",
    shortcut: "/logo.webp",
  },
  manifest: "/manifest.json",

  // Verification Tags (Moved here for clean code)
  verification: {
    other: {
      'impact-site-verification': '3db21adf-1799-49cc-850a-ee1371f30345',
    },
  },
};

export default function RootLayout({ children }) {
  // JSON-LD Schema (Structured Data for Google)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CashTree Network",
    "url": "https://cashttree.online/",
    "logo": "https://cashttree.online/logo.webp",
    "sameAs": [
      "https://t.me/CashtTree_bot" 
    ],
    "description": "Performance marketing network connecting publishers with financial and gaming brands."
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Security: Force HTTPS */}
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
      </head>
      
      <body className={`${inter.className} bg-black text-white antialiased`}>
        
        {/* GOOGLE SCHEMA SCRIPT */}
        <Script
          id="json-ld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* MAIN APP CONTENT */}
        {children}
        
      </body>
    </html>
  );
}