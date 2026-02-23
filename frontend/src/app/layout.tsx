import type { Metadata } from "next";
import "./globals.css";
import "./redesign.css";

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
    <html lang="en">
      <body className="min-h-screen text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
