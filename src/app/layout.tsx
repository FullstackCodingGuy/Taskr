"use client"
import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import "./globals.css";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";

const metadata: Metadata = {
  applicationName: "Taskr",
  description: "Personal task manager",
};

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
  session,
}: Readonly<{
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
}>) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.applicationName}</title>
      </head>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
