"use client";

// Self-hosted Umami analytics (Amplitude o'rnini bosadi).
// Script `afterInteractive` bilan yuklanadi (Next nested layout'da
// beforeInteractive ishonchsiz — script umuman yuklanmasdi). Tracker
// PerformanceObserver'ni `buffered:true` bilan ishlatadi, shuning uchun
// web-vitals (Performance sahifasi) kech yuklansa ham buffer'dan olinadi.
// Generic "click" YO'Q — aniq nomli eventlar `track()` orqali.

import Script from "next/script";

const WEBSITE_ID = "2699cd62-0385-4c4a-9d52-2c47e5512e53";

type UmamiApi = { track: (event?: string, data?: Record<string, unknown>) => void };
declare global {
  interface Window {
    umami?: UmamiApi;
  }
}

/** Aniq nomli event yuborish — call-site'larda ishlatiladi. */
export function track(event: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined") window.umami?.track(event, data);
}

function Analytics() {
  return (
    <Script
      defer
      src="https://umami.botspace.uz/script.js"
      data-website-id={WEBSITE_ID}
      strategy="afterInteractive"
    />
  );
}

export default Analytics;
