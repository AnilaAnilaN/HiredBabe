import type { Metadata } from "next";
import { Space_Grotesk, Syne } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "HiredBabe | AI Interview Coach",
  description: "Bridge the gap between knowing the answer and nailing the delivery with HiredBabe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${spaceGrotesk.variable} antialiased`} suppressHydrationWarning>
        <Header />
        {children}
      </body>
    </html>
  );
}
