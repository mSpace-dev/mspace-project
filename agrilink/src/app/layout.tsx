import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Footer from "@/components/Footer";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "AgriLink - Sri Lanka Agricultural Platform",
  description: "Connect farmers, buyers, and agricultural resources across Sri Lanka",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#16a34a" />
        {/* Mobile home screen icons (placeholders) */}
        <link rel="icon" href="/icon-192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
      </head>
      <body
        className="antialiased"
      >
        <Providers>
          {children}
          <Footer />
          <ServiceWorkerRegistration />
        </Providers>
      </body>
    </html>
  );
}
