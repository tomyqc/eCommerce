import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import 'svgmap/dist/svgMap.min.css';
import SessionProvider from "@/utils/SessionProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/Providers";
import SessionTimeoutWrapper from "@/components/SessionTimeoutWrapper";
import prisma from "@/utils/db";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aiden Store",
  description: "Professional Dental & Cosmetic Supplies.",
  icons: {
    icon: "/WebIcon.png",
    shortcut: "/WebIcon.png",
    apple: "/WebIcon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  const siteSettings = await prisma.siteSettings.upsert({ where: { id: "default" }, create: { logoPath: "/Logo.png", backgroundPath: "/ChatGPT Image Aug 20, 2026, 01_07_50 PM.png" }, update: {} });
  return (
    <html lang="en" data-theme="light">
      <body className={inter.className} style={{ "--site-background-image": `url("${siteSettings.backgroundPath}")`, "--site-background-opacity": siteSettings.backgroundOpacity } as React.CSSProperties}>
        <SessionProvider session={session}>
          <SessionTimeoutWrapper />
          <Header />
          <Providers>
            {children}
          </Providers>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
