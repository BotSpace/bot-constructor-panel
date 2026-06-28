// Self-hosted Umami analytics (Amplitude o'rnini bosadi).
// MUHIM: bu SERVER component (no "use client") — plain <script> SSR HTML'ga
// chiqadi va HAR sahifa yuklanganda ishonchli yuklanadi. next/script
// (afterInteractive/beforeInteractive) client-side inject qilardi va
// constructor'da yuklanmasdi (cache'langan chunk + nested layout muammosi).
// `track()` esa client component'lardan chaqiriladigan oddiy funksiya.

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
    <script
      defer
      src="https://umami.botspace.uz/script.js"
      data-website-id={WEBSITE_ID}
    />
  );
}

export default Analytics;
