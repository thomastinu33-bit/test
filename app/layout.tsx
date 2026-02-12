import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { SideNav } from "@/components/Evertune";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Tracker Table",
  description: "Tracker dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} antialiased`}>
        <div className="min-h-screen">
          <SideNav />
          <main className="ml-[280px] h-screen flex flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
