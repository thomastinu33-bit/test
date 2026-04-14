import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { TrackerProvider } from "./TrackerContext";
import { RootLayoutContent } from "./RootLayoutClient";
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
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <TrackerProvider>
          <RootLayoutContent dmSansFontClass={dmSans.variable}>
            {children}
          </RootLayoutContent>
        </TrackerProvider>
      </body>
    </html>
  );
}
