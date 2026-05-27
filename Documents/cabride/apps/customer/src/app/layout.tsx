import type { Metadata } from "next";
import "./globals.css";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "4jtravel — Book a Ride",
  description: "Fast, safe cab booking in Arunachal Pradesh",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
