"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  createSimpleNotification,
  createPersistentNotification,
  createVibratingNotification,
} from "@/lib/notification-utils";
import { useNotificationContext } from "@/components/common/notification-provider";
// import second from "../../../../public/notification.mp3";

/**
 * Demo component showing how to use the notification system
 * This can be used for testing or as a reference
 */
export default function NotificationDemo() {
  const {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    checkPermission,
  } = useNotificationContext();

  const [permissionStatus, setPermissionStatus] = useState(permission);

  useEffect(() => {
    setPermissionStatus(permission);
  }, [permission]);

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    setPermissionStatus(result);
  };

  const handleSendSimpleNotification = async () => {
    await sendNotification(
      createSimpleNotification(
        "Salom!",
        "Bu oddiy bildirishnoma",
        undefined // Default audio will be used
      )
    );
  };

  const handleSendNotificationWithCustomAudio = async () => {
    // Example: You can use any audio URL
    await sendNotification(
      createSimpleNotification(
        "Maxsus Audio",
        "Bu bildirishnoma maxsus audio bilan"
      )
    );
  };

  const handleSendPersistentNotification = async () => {
    await sendNotification(
      createPersistentNotification(
        "Muhim Xabar",
        "Bu bildirishnoma foydalanuvchi tomonidan yopilishi kerak"
      )
    );
  };

  const handleSendVibratingNotification = async () => {
    await sendNotification(
      createVibratingNotification(
        "Vibratsiya",
        "Bu bildirishnoma vibratsiya bilan"
      )
    );
  };

  if (!isSupported) {
    return (
      <div className="p-4 border rounded-lg">
        <p className="text-red-500">
          Bu brauzerda bildirishnomalar qo'llab-quvvatlanmaydi
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Notification Demo</h2>
        <div className="flex items-center gap-2">
          <span>Ruxsat holati:</span>
          <Badge
            variant={
              permissionStatus === "granted"
                ? "default"
                : permissionStatus === "denied"
                ? "destructive"
                : "secondary"
            }
          >
            {permissionStatus === "granted"
              ? "Berilgan"
              : permissionStatus === "denied"
              ? "Rad etilgan"
              : "Kutilmoqda"}
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        {permissionStatus !== "granted" && (
          <Button onClick={handleRequestPermission} className="w-full">
            Ruxsat so'rash
          </Button>
        )}

        <Button
          onClick={handleSendSimpleNotification}
          disabled={permissionStatus !== "granted"}
          className="w-full"
        >
          Oddiy bildirishnoma yuborish
        </Button>

        <Button
          onClick={handleSendNotificationWithCustomAudio}
          disabled={permissionStatus !== "granted"}
          className="w-full"
        >
          Maxsus audio bilan bildirishnoma
        </Button>

        <Button
          onClick={handleSendPersistentNotification}
          disabled={permissionStatus !== "granted"}
          className="w-full"
        >
          Doimiy bildirishnoma yuborish
        </Button>

        <Button
          onClick={handleSendVibratingNotification}
          disabled={permissionStatus !== "granted"}
          className="w-full"
        >
          Vibratsiya bilan bildirishnoma
        </Button>

        <Button onClick={checkPermission} variant="outline" className="w-full">
          Ruxsatni tekshirish
        </Button>
      </div>
    </div>
  );
}
