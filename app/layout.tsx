import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientProviders } from "./clientProvider";
import Script from "next/script";

export const metadata: Metadata = {
  applicationName: "Surplus TopUp",
  title: "Surplus TopUp – Instant VTU Recharge, Bills & More",
  description:
    "Surplus TopUp offers fast and affordable airtime, data recharge, bill payments, and more. Enjoy seamless VTU services across Nigeria.",
  keywords: [
    "Surplus",
    "VTU",
    "Airtime Recharge",
    "Data Recharge",
    "Electricity Bill",
    "TV Subscription",
    "WAEC Payment",
    "Affordable VTU",
    "Recharge Cards",
  ],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Surplus TopUp",
  },
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL("https://www.surplus.ng/"),
  openGraph: {
    title: "Surplus – Instant VTU Recharge, Bills & More",
    description:
      "Fast, reliable and affordable virtual top-up (VTU) services including airtime, data, electricity, education and TV subscriptions.",
    url: "https://www.surplus.ng/",
    siteName: "Surplus TopUp",
    type: "website",
    locale: "en_NG",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Google AdSense Script */}
        <Script
          id="adsense-script"
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5872708392333567"
        />
      </head>
      <body
        suppressHydrationWarning={true}
        className="antialiased"
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
