// (public)/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { prisma } from "@/lib/prisma";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tropicana Worldwide Corporation",
  description: "Experience Unforgettable Hospitality",
};

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch data required for header and footer
  const allHotelsData = await prisma.businessUnit.findMany({ where: { isPublished: true }, orderBy: { sortOrder: 'asc'} });
  const websiteConfigData = await prisma.websiteConfiguration.findFirst();

  // **FIX:** Serialize the data to convert Decimals and other non-plain objects
  const allHotels = JSON.parse(JSON.stringify(allHotelsData));
  const websiteConfig = JSON.parse(JSON.stringify(websiteConfigData));

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <div className="flex flex-col min-h-screen">
          
          <PublicHeader allHotels={allHotels} websiteConfig={websiteConfig} />
        
          <main className="flex-grow">
            {children}
          </main>
          
        <PublicFooter allHotels={allHotels} websiteConfig={websiteConfig} />
          
        </div>
      </body>
    </html>
  );
}