import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bedtime Stories | AI Storyteller",
  description: "Create safe, comforting bedtime stories for children aged 5-10",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0d0d0d] text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
