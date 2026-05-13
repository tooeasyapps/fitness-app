import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ver & Val Fitness",
  description: "Personal training tracker for Ver and Val",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
