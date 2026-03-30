import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./clientProvider";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Almaleek TopUp – Instant VTU Recharge, Bills & More",
  description:
    "Almaleek TopUp offers fast and affordable airtime, data recharge, bill payments, and more. Enjoy seamless VTU services across Nigeria.",
  keywords: [
    "Almaleek",
    "VTU",
    "Airtime Recharge",
    "Data Recharge",
    "Electricity Bill",
    "TV Subscription",
    "WAEC Payment",
    "Affordable VTU",
    "Recharge Cards",
  ],
  icons: {
    icon: "/images/logo.png",
  },
  metadataBase: new URL("https://www.almaleek.com.ng/"),
  openGraph: {
    title: "Almaleek – Instant VTU Recharge, Bills & More",
    description:
      "Fast, reliable and affordable virtual top-up (VTU) services including airtime, data, electricity, education and TV subscriptions.",
    url: "https://www.almaleek.com.ng/",
    siteName: "Almaleek TopUp",
    type: "website",
    locale: "en_NG",
  },
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
