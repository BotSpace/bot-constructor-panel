import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/common/theme-provider";

import { NextIntlClientProvider } from "next-intl";

import AuthProvider from "./AuthProvider";
import ReactQueryProvider from "./ReactQueryProvider";
import { Toaster } from "react-hot-toast";
import { WebSocketProvider } from "@/wss/web-socket-provider";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Loading...",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: any;
}>) {
  const { lang } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(lang as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({ locale: lang });

  return (
    <html lang={lang} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <AuthProvider>
            <WebSocketProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
              >
                <NextIntlClientProvider messages={messages}>
                  {children}
                </NextIntlClientProvider>
                <Toaster position="top-center" reverseOrder={false} />
              </ThemeProvider>
            </WebSocketProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
