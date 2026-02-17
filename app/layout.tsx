import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iPhone Wallpaper Creator",
  description:
    "iPhoneの壁紙をブラウザで作成。機種選択・トリミング・ドット絵スタンプ配置・PNGダウンロード。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <footer className="border-t border-zinc-800 py-3 text-center text-sm text-zinc-500">
          <Link href="/credits" className="hover:text-zinc-300 underline">
            Credits
          </Link>
        </footer>
      </body>
    </html>
  );
}
