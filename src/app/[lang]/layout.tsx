import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/common/theme-provider";

import { NextIntlClientProvider } from "next-intl";

import AuthProvider from "@/app/[lang]/AuthProvider";
import ReactQueryProvider from "@/app/[lang]/ReactQueryProvider";
import { Toaster } from "react-hot-toast";
import { WebSocketProvider } from "@/wss/web-socket-provider";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import Analytics from "@/components/common/analitics";
import { NotificationProvider } from "@/components/common/notification-provider";
import { NotificationAlert } from "@/components/common/notification-alert";

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

export const viewport: Viewport = {
  viewportFit: "cover",
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
      <head>
        <Analytics />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <AuthProvider>
            <WebSocketProvider>
              <NotificationProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="dark"
                >
                  <NextIntlClientProvider messages={messages}>
                    {children}
                    {/* <NotificationAlert /> */}
                  </NextIntlClientProvider>
                  <Toaster position="top-center" reverseOrder={false} />
                </ThemeProvider>
              </NotificationProvider>
            </WebSocketProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
