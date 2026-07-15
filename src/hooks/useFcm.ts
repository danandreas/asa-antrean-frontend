"use client";

import { showPersistentQueueAlert } from "@/components/PersistentQueueAlert";
import { api } from "@/lib/api";
import {
  buildServiceWorkerUrl,
  getMessagingInstance,
  isFirebaseConfigured,
} from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";
import error from "next/dist/api/error";
import { useEffect } from "react";

const FCM_TOKEN_STORAGE_KEY = "pq_fcm_token";

export function useFcmRegistration(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (!isFirebaseConfigured()) {
      console.warn(
        "Firebase belum terkonfigurasi — cek NEXT_PUBLIC_FIREBASE_* di Vercel.",
      );
      return;
    }
    if (typeof window === "undefined" || !("Notification" in window)) return;

    let unsubscribeOnMessage: (() => void) | undefined;
    let isCancelled = false;

    async function register() {
      try {
        const permission =
          Notification.permission === "default"
            ? await Notification.requestPermission()
            : Notification.permission;

        if (permission !== "granted") return;

        const registration = await navigator.serviceWorker.register(
          buildServiceWorkerUrl(),
        );

        const messaging = await getMessagingInstance();
        if (!messaging || isCancelled) return;

        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (!token || isCancelled) return;

        const previousToken = window.localStorage.getItem(
          FCM_TOKEN_STORAGE_KEY,
        );
        if (previousToken !== token) {
          await api.post("/device-tokens", { token, platform: "web" });
          window.localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
        }

        unsubscribeOnMessage = onMessage(messaging, (payload) => {
          showPersistentQueueAlert(
            payload.notification?.title || "Antrean Anda Segera Tiba",
            payload.notification?.body || "",
          );
        });
      } catch {
        // Diamkan: perangkat/browser mungkin tidak mendukung push, atau izin ditolak.
        // Aplikasi tetap berfungsi normal tanpa notifikasi real-time.
        console.error("FCM registration gagal:", error);
      }
    }

    register();

    return () => {
      isCancelled = true;
      unsubscribeOnMessage?.();
    };
  }, [enabled]);
}

export async function removeFcmToken() {
  if (typeof window === "undefined") return;
  const token = window.localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
  if (!token) return;

  try {
    await api.delete("/device-tokens", { data: { token } });
  } catch {
    // Diamkan; token akan otomatis dianggap invalid oleh backend saat FCM menolaknya
  } finally {
    window.localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
  }
}
