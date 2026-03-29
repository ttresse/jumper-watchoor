import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JumperWatchoor",
  description: "Track your Jumper Exchange reward points across all chains",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="talentapp:project_verification" content="9f87cd056126d1da5141575ad0378367c58678dc89df7fa0f21a4049e280dd4b3644a9d4b7d9b32711ae81863ed31fe99ea032ac55f3815052911586e38a8629" />
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="7b0dcd64-3857-4a76-8881-78ee8268445f"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Providers>
          <div className="flex-1">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
