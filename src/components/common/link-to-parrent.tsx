"use client";

import { useParams } from "next/navigation";
import env from "@/lib/env";

type UseLinkToParentOptions = {
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
};

export function useLinkToParent(options: UseLinkToParentOptions = {}) {
  const { lang } = useParams();

  function handleClick(e: React.MouseEvent) {
    // Tashqaridan berilgan onClick ni chaqiramiz
    options.onClick?.(e);

    // Agar event preventDefault qilingan bo'lsa, navigation o'tkazib yuboramiz
    if (e.defaultPrevented) {
      return;
    }

    if (window) {
      const rawHref = options.href || `/${lang}`;
      // Relative path bo'lsa, ADMIN_PANEL bazasiga biriktir
      const targetUrl = rawHref.startsWith("http")
        ? rawHref
        : (env.ADMIN_PANEL ?? "").replace(/\/$/, "") + rawHref;
      window.location.href = targetUrl;
    }
  }

  return { handleClick };
}

// Foydalanish misoli:
/*
function MyComponent() {
  const { handleClick } = useLinkToParent({ 
    href: "/dashboard",
    onClick: (e) => console.log("Clicked!") 
  });

  return (
    <Button onClick={handleClick}>
      Go to Dashboard
    </Button>
  );
}

// Yoki oddiygina:
function MyComponent() {
  const { handleClick } = useLinkToParent();

  return (
    <div onClick={handleClick}>
      Click me to go parent
    </div>
  );
}
*/
