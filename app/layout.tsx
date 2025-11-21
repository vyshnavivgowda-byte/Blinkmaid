import "./globals.css";
import { ReactNode } from "react";
import { ToastProvider } from "@/app/components/toast/ToastContext";

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
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
