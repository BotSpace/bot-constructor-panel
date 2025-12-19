'use client'

import { handleStartWork } from "@/lib/landscape-screen";
import { Button } from "../ui/button";

// components/common/OrientationGuard.tsx
export const OrientationGuard = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900 text-white p-6 md:hidden portrait:flex landscape:hidden">
      <div className="animate-bounce mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
          <path d="M12 18h.01" />
          <path d="m15 5 3 3-3 3" />
          <path d="M18 8H10a3 3 0 0 0-3 3v2" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-center">Iltimos, qurilmani gorizontal holatga o'tkazing</h2>
      <p className="text-center text-slate-400 mt-2">
        Constructor interfeysi gorizontal ekranda ishlashga mo'ljallangan.
      </p>
      <Button onClick={handleStartWork}>Qilish</Button>
    </div>
  );
};
