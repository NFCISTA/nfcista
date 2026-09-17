import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://nfcista.vercel.app"),
  title: "NFCISTA - Smart NFC Business Cards",
  description:
    "NFCISTA creates smart NFC digital business cards that make sharing your contact and business details simple.",
  keywords: [
    "NFCISTA",
    "NFC business card",
    "digital business card",
    "smart business card",
    "contact sharing",
  ],
  authors: [{ name: "NFCISTA" }],
  creator: "NFCISTA",
  publisher: "NFCISTA",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NFCISTA - Smart NFC Business Cards",
    description:
      "NFCISTA creates smart NFC digital business cards that make sharing your contact and business details simple.",
    url: "https://nfcista.vercel.app/",
    siteName: "NFCISTA",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NFCISTA - Smart NFC Business Cards",
    description:
      "NFCISTA creates smart NFC digital business cards that make sharing your contact and business details simple.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={hanken.variable}>
      <head>
        {/* Material Symbols Outlined — icon font used by the Stitch design */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin=""
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="bg-[#F8FAFC] font-sans text-on-surface antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}