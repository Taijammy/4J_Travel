import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "4jtravel — Driver",
  description: "Driver app for 4jtravel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
