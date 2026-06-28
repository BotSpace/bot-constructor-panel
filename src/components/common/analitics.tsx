"use client";

// Self-hosted Umami analytics (Amplitude o'rnini bosadi).
// Asosiy script pageview'larni avtomatik yig'adi; useEffect esa har bosish
// (tugma/link), forma yuborish va tashqi linkni global ushlaydi —
// Amplitude'ning elementInteractions autocapture'iga ekvivalent.

import Script from "next/script";
import { useEffect } from "react";

const WEBSITE_ID = "5593ff21-f352-4598-9eb1-981bd9693334";

type UmamiApi = { track: (event?: string, data?: Record<string, unknown>) => void };
declare global {
  interface Window {
    umami?: UmamiApi;
  }
}

function track(event: string, data?: Record<string, unknown>) {
  window.umami?.track(event, data);
}

function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim().slice(0, 80);
}

function Analytics() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element)?.closest?.(
        'a,button,[role="button"],input[type="submit"],input[type="button"]'
      ) as HTMLElement | null;
      if (!el) return;
      const label = clean(
        el.getAttribute("aria-label") ||
          (el as HTMLInputElement).value ||
          el.textContent ||
          ""
      );
      const href = el.getAttribute("href") || undefined;
      const data: Record<string, unknown> = {
        label: label || el.tagName.toLowerCase(),
        tag: el.tagName.toLowerCase(),
        path: location.pathname,
      };
      if (href) {
        data.href = href;
        try {
          const u = new URL(href, location.href);
          if (u.host && u.host !== location.host) {
            track("outbound", { href: u.href, path: location.pathname });
          }
        } catch {
          /* relative/hash — e'tiborsiz */
        }
      }
      track("click", data);
    };

    const onSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLElement | null;
      if (!form || form.tagName !== "FORM") return;
      track("form-submit", {
        form:
          form.getAttribute("id") ||
          form.getAttribute("name") ||
          form.getAttribute("aria-label") ||
          "form",
        path: location.pathname,
      });
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

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
