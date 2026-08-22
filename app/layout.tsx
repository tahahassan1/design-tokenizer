import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brand Tokens Generator",
  description: "توليد design tokens (ألوان، خطوط، radius، shadow) من لوجو وأسئلة قصيرة",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-50 text-gray-900 min-h-screen">{children}</body>
    </html>
  );
}
