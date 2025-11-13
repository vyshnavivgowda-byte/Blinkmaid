import "./globals.css";

export const metadata = {
  title: "BlinkMaid",
  description: "Professional Maid & Cleaning Services",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
