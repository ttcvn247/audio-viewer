import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const mfsFont = localFont({
  src: "../fonts/mfs-regular-2.0.2.woff",
  variable: "--font-mfs",
});

import db from '@/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  let title = "Avaya Viewer";
  try {
    const setting = db.prepare("SELECT value FROM settings WHERE key = 'APP_NAME'").get() as { value: string } | undefined;
    if (setting?.value) title = setting.value;
  } catch (error) {
    console.error("Failed to load APP_NAME for metadata:", error);
  }
  return {
    title,
    description: "Phần mềm quản lý hệ thống ghi âm",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${mfsFont.variable}`}>
      <body className={`${mfsFont.className} min-h-full flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}
