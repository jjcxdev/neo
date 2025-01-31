import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetBrains = JetBrains_Mono({
  variable: "--font-jetBrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "jjcx chat",
  description: "by jjcx",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jetBrains.className} dark antialiased`}>{children}</body>
    </html>
  );
}
