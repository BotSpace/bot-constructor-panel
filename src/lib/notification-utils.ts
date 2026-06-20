/**
 * Notification utility functions
 * Helper functions for common notification operations
 */

import { NotificationOptions } from "@/hooks/use-notification";

/**
 * Create a simple notification with default settings
 */
export function createSimpleNotification(
  title: string,
  body?: string,
  audioUrl?: string
): NotificationOptions {
  return {
    title,
    body,
    requireInteraction: false,
    silent: false,
  };
}

/**
 * Create a persistent notification that requires user interaction
 */

/**
 * Create a silent notification (no sound)
 */

/**
 * Create a notification with vibration pattern
 */
