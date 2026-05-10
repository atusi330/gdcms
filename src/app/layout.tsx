import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "gdcms",
  description: "Google Drive powered CMS for simple static websites.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
