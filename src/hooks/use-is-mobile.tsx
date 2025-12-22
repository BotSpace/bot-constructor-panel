import { useState, useEffect } from "react";

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      // 1. UserAgent orqali tekshirish
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      );

      // 2. Ekran o'lchami orqali tekshirish (masalan, 768px dan kichik bo'lsa)
      const isSmallScreen = window.innerWidth <= 768;

      setIsMobile(isMobileUA || isSmallScreen);
    };

    // Dastlabki tekshiruv
    checkMobile();

    // Ekran o'zgarishini kuzatib borish
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};
