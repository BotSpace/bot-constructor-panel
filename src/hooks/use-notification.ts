"use client";

import { useCallback, useEffect, useState } from "react";
// import notificationAudio from "../../public/notification.mp3";

export type NotificationPermission = "default" | "granted" | "denied";

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  data?: any;
}

export interface UseNotificationReturn {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  sendNotification: (options: NotificationOptions) => Promise<void>;
  checkPermission: () => NotificationPermission;
}

/**
 * System-level notification hook
 * Provides functionality to check, request, and send browser notifications
 * with custom audio support
 */
export function useNotification(): UseNotificationReturn {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  // Check if notifications are supported
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission as NotificationPermission);
    }
  }, []);

  /**
   * Check current notification permission status
   */
  const checkPermission = useCallback((): NotificationPermission => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }
    const currentPermission = Notification.permission as NotificationPermission;
    setPermission(currentPermission);
    return currentPermission;
  }, []);

  /**
   * Request notification permission from user
   */
  const requestPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (typeof window === "undefined" || !("Notification" in window)) {
        return "denied";
      }

      if (Notification.permission === "granted") {
        setPermission("granted");
        return "granted";
      }

      if (Notification.permission === "denied") {
        setPermission("denied");
        return "denied";
      }

      try {
        const result = await Notification.requestPermission();
        const permissionStatus = result as NotificationPermission;
        setPermission(permissionStatus);
        return permissionStatus;
      } catch (error) {
        console.error("Error requesting notification permission:", error);
        setPermission("denied");
        return "denied";
      }
    }, []);

  /**
   * Play custom audio for notification
   * Uses imported audio file from assets folder as default
   */
  const playNotificationAudio = useCallback(async () => {
    // Use imported audio file as default if no custom URL provided
    // const audioSource = audioUrl || notificationAudio;

    try {
      const audio = new Audio("/notification.mp3");
      audio.volume = 0.7;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Silently ignore autoplay policy errors
          if (error.name !== "NotAllowedError") {
            console.error("Error playing notification audio:", error);
          }
        });
      }
    } catch (error) {
      console.error("Error loading notification audio:", error);
    }
  }, []);

  /**
   * Send a notification with optional custom audio
   */
  const sendNotification = useCallback(
    async (options: NotificationOptions): Promise<void> => {
      if (typeof window === "undefined" || !("Notification" in window)) {
        console.warn("Notifications are not supported in this browser");
        return;
      }

      // Check permission first
      const currentPermission = checkPermission();

      if (currentPermission !== "granted") {
        console.warn(
          "Notification permission not granted. Current status:",
          currentPermission
        );
        // Try to request permission if not denied
        if (currentPermission !== "denied") {
          const requestedPermission = await requestPermission();
          if (requestedPermission !== "granted") {
            console.warn("User denied notification permission");
            return;
          }
        } else {
          console.warn("Notification permission was previously denied");
          return;
        }
      }

      try {
        // Create notification options
        const notificationOptions: NotificationOptions = {
          requireInteraction: false,
          silent: false,
          ...options,
        };

        // Create and show notification
        const notification = new Notification(notificationOptions.title, {
          body: notificationOptions.body,
          icon: notificationOptions.icon,
          badge: notificationOptions.badge,
          tag: notificationOptions.tag,
          requireInteraction: notificationOptions.requireInteraction,
          silent: notificationOptions.silent,
          ...(notificationOptions.vibrate && {
            vibrate: notificationOptions.vibrate,
          }),
          ...(notificationOptions.data && { data: notificationOptions.data }),
        } as any);

        // Play custom audio if provided or use default
        if (!notificationOptions.silent) {
          await playNotificationAudio();
        }

        // Auto-close notification after 5 seconds if not requireInteraction
        if (!notificationOptions.requireInteraction) {
          setTimeout(() => {
            notification.close();
          }, 5000);
        }

        // Handle notification click
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    },
    [checkPermission, requestPermission, playNotificationAudio]
  );

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    checkPermission,
  };
}
