import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "BlinkMaid",
  description: "Professional Maid & Cleaning Services",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
