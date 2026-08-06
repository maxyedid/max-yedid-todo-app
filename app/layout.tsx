import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "To-Do",
  description: "A simple to-do list app from my Tabs interview",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
