"use client";

import React, { createContext, useContext, ReactNode } from "react";
import {
  useNotification,
  NotificationOptions,
  NotificationPermission,
} from "@/hooks/use-notification";

interface NotificationContextType {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  sendNotification: (options: NotificationOptions) => Promise<void>;
  checkPermission: () => NotificationPermission;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const notification = useNotification();

  return (
    <NotificationContext.Provider value={notification}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to access notification functionality from context
 * @throws Error if used outside NotificationProvider
 */
export function useNotificationContext(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within NotificationProvider"
    );
  }
  return context;
}
