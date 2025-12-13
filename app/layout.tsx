import "./globals.css";
import { ReactNode } from "react";
import { ToastProvider } from "@/app/components/toast/ToastContext";
import Script from "next/script";

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
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
     <ToastProvider>
  {children}
</ToastProvider>

      </body>
    </html>
  );
}
