import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "End-to-End DevOps Project",
  description: "Frontend for the dockerized DevOps demo stack",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
