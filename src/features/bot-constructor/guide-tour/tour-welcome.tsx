"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { driver } from "driver.js";
import "driver.js/dist/driver.css"; // CSSni unutmaslik kerak!
import { Sparkles, Map } from "lucide-react";
import { tourConfig } from "@/lib/tour-steps";

export function TourWelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenTour");

    if (!hasSeenTour) {
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleStartTour = () => {
    setOpen(false);
    localStorage.setItem("hasSeenTour", "true");

    // Driver.js ni ishga tushirish
    const driverObj = driver(tourConfig);
    driverObj.drive();
  };

  const handleSkip = () => {
    setOpen(false);
    localStorage.setItem("hasSeenTour", "true");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[400px] max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-6">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl text-center font-bold">
              Qo'llanma !
            </DialogTitle>
            <DialogDescription className="pt-2">
              Platformamizni yaxshiroq tushunishingiz uchun sizga qisqa qo'llanmani ko'rsatmoqchimiz.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 p-3 rounded-lg flex items-start gap-3 border border-indigo-100">
            <Map className="" size={40} />
            <p className="text-sm text-green-500 leading-relaxed">
              Bu qo'llanma 1 daqiqadan kam vaqt oladi. Istalgan vaqtda to'xtatishingiz mumkin.
            </p>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 flex gap-3">
          <Button variant="outline" onClick={handleSkip} className="flex-1">
            Keyinroq
          </Button>
          <Button onClick={handleStartTour} className="flex-1">
            Boshladik
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
