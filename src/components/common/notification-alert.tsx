"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useNotificationContext } from "./notification-provider";

interface NotificationAlertProps {
  onAllow?: () => void;
  onDeny?: () => void;
}

export function NotificationAlert({ onAllow, onDeny }: NotificationAlertProps) {
  const { isSupported, permission, requestPermission } =
    useNotificationContext();

  const [isAllow, setIsAllow] = useState<boolean>(false);
  const [isDenied, setIsDenied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const shouldShow =
    isSupported &&
    !(permission === "granted") &&
    !isAllow &&
    !isDenied &&
    isVisible;

  async function handleAllow() {
    setIsLoading(true);
    try {
      const result = await requestPermission();
      if (result === "granted") {
        setIsAllow(true);
        onAllow?.();
        // Fade out after success
        setTimeout(() => setIsVisible(false), 300);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  }

  function handleDeny() {
    setIsDenied(true);
    onDeny?.();
    // Fade out after deny
    setTimeout(() => setIsVisible(false), 300);
  }

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <div className="relative bg-background border border-border rounded-xl shadow-lg overflow-hidden">
            {/* Subtle gradient accent */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />

            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                >
                  <Bell className="w-5 h-5 text-foreground" />
                </motion.div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <h3 className="text-sm font-semibold text-foreground">
                    Bildirishnomalarni yoqish
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Yangiliklar va muhim xabarlardan xabardor bo'ling
                  </p>
                </motion.div>

                {/* Close button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={handleDeny}
                  disabled={isLoading}
                  className="flex-shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.2 }}
                className="mt-4 flex items-center gap-3"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeny}
                  disabled={isLoading}
                  className="flex-1 h-9 text-sm font-medium bg-transparent"
                >
                  Keyinroq
                </Button>
                <Button
                  size="sm"
                  onClick={handleAllow}
                  disabled={isLoading}
                  className="flex-1 h-9 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 disabled:opacity-70"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="w-4 h-4" />
                      <span>Kutilmoqda...</span>
                    </span>
                  ) : (
                    "Ruxsat berish"
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
