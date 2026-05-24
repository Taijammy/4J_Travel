import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "4jtravel — Book a Ride",
  description: "Fast, safe cab booking",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
