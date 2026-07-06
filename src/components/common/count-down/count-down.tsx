
"use client";

import { useEffect, useState } from "react";
import { CountdownItem } from "@/components/common/count-down/count-down-item";
import { useNotificationContext } from "@/components/common/notification-provider";
import { createSimpleNotification } from "@/lib/notification-utils";

export default function CountdownComponent({ updated_at }: { updated_at: Date | string }) {
    const { sendNotification } = useNotificationContext();

    // 1. Maqsadli vaqt: updated_at + 30 daqiqa
    const targetDate = new Date(new Date(updated_at).getTime() + 30 * 60 * 1000);

    const calculateTimeLeft = () => {
        const difference = +targetDate - +new Date();
        if (difference <= 0) return { hours: 0, minutes: 0, seconds: 0, isCompleted: true };

        return {
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            isCompleted: false
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            // 2. Vaqt tugaganda bildirishnoma yuborish logikasi
            if (newTimeLeft.isCompleted) {
                clearInterval(timer);

                // Notification funksiyasini shu yerda chaqiramiz
                sendNotification(
                    createSimpleNotification(
                        "Debug bot o'chirildi",
                        "Debug bot uchun ajiratilgan 30 daqiqa tugadi! Testni davom ettirish uchun debug botni qaytatdan ishga tushiring"
                    )
                );
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [updated_at]); // updated_at o'zgarsa taymer qayta hisoblanadi

    // 3. Agar vaqt tugagan bo'lsa, hech narsa ko'rsatmaslik (null qaytarish)
    if (timeLeft.isCompleted) return null;

    return (
        <div className="flex items-center gap-0.5 text-xl font-semibold">
            <CountdownItem value={timeLeft.minutes} padStart={true} />
            <span className="text-zinc-500">:</span>
            <CountdownItem value={timeLeft.seconds} padStart={true} />
        </div>
    );
}
