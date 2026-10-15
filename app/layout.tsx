import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "네북케이터 · 영남대학교 법학도서관",
  description: "책을 찾는 가장 쉬운 길. 다국어 3D 도서관 탐색과 이용자 문의 서비스.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
