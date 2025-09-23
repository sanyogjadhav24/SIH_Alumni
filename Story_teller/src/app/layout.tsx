import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Story Teller - AI Post Analyzer",
  description: "Analyze post images and text to generate AI-powered summaries",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}