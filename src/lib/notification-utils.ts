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
export function createPersistentNotification(
  title: string,
  body?: string,
  audioUrl?: string
): NotificationOptions {
  return {
    title,
    body,
    requireInteraction: true,
    silent: false,
  };
}

/**
 * Create a silent notification (no sound)
 */
export function createSilentNotification(
  title: string,
  body?: string
): NotificationOptions {
  return {
    title,
    body,
    silent: true,
    requireInteraction: false,
  };
}

/**
 * Create a notification with vibration pattern
 */
export function createVibratingNotification(
  title: string,
  body?: string,
  audioUrl?: string,
  vibratePattern: number[] = [200, 100, 200]
): NotificationOptions {
  return {
    title,
    body,
    vibrate: vibratePattern,
    requireInteraction: false,
    silent: false,
  };
}
