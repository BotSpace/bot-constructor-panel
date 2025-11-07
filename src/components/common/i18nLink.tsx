"use client";

import React from "react";
import Link from "next/link";
import type { LinkProps } from "next/link";
import { useParams, useRouter } from "next/navigation";

interface MultiTenantLinkProps extends LinkProps {
  children: React.ReactNode;
  // Boshqa LinkProps xususiyatlarini ham qabul qiladi, masalan, target="_blank", rel, va hokazo.
}

const MultiTenantLink: React.FC<MultiTenantLinkProps> = ({
  href,
  children,
  ...props
}) => {
  const { locale, bot } = useParams();

  // constructorPrefix ni dinamik ravishda yaratamiz
  // router.asPath Constructor ilovasi ichidagi hozirgi URL ni qaytaradi.
  // Bizga esa faqat prefix qismi kerak.
  // Masalan: /en/bot/16/constructor/some-page
  // Bizga /en/bot/16/constructor kerak
  let constructorPrefix = "";
  if (locale && bot) {
    // Agar locale va bot ID mavjud bo'lsa, prefixni yaratamiz
    constructorPrefix = `/${locale}/bot/${bot}/constructor`;
  }
  // Agar boshqa holatda (masalan, alohida ishga tushirilganda), prefixsiz ishlasin.
  // Yoki constructor loyihasi uchun boshqa base path ni belgilashingiz mumkin.
  // const constructorBasePath = '/share'; // Agar alohida ishga tushirilganda /share basePath bo'lsa

  let finalHref: string = href.toString();

  // Agar href mutlaq URL bo'lmasa va '/' bilan boshlansa
  if (finalHref.startsWith("/") && constructorPrefix) {
    // "/share" kabi qoldiq basePath ni olib tashlash (agar constructor o'zini shunday deb bilsa)
    // Bu qism constructor loyihasi next.config.js da basePath ni olib tashlagan bo'lsa ham kerak bo'lishi mumkin.
    // Agar constructor ichida linklar `/some-page` bo'lsa, bu yerda `/share` ni olib tashlamaymiz.
    // Agar u hali ham `/share/some-page` deb yaratayotgan bo'lsa, o'zgartirish kerak.

    // Eng to'g'ri yechim: constructor ichidagi linklar shunchaki `/some-page` bo'lishi kerak.
    // O'sha `/some-page` ga constructorPrefix ni qo'shish.
    finalHref = `${constructorPrefix}${finalHref}`;
  }

  return (
    <Link href={finalHref} {...props}>
      {children}
    </Link>
  );
};

export default MultiTenantLink;
