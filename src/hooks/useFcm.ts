"use client";

import { showPersistentQueueAlert } from "@/components/PersistentQueueAlert";
import { api } from "@/lib/api";
import {
  buildServiceWorkerUrl,
  getMessagingInstance,
  isFirebaseConfigured,
} from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";
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
      console.log("[FCM] Mulai proses registrasi...");

      if (typeof window === "undefined" || !("Notification" in window)) {
        console.warn("[FCM] Browser tidak mendukung Notification API.");
        return;
      }

      console.log("[FCM] Status izin saat ini:", Notification.permission);

      try {
        const permission =
          Notification.permission === "default"
            ? await Notification.requestPermission()
            : Notification.permission;

        console.log("[FCM] Hasil izin:", permission);

        if (permission !== "granted") {
          console.warn("[FCM] Izin tidak diberikan, berhenti di sini.");
          return;
        }

        console.log("[FCM] Mendaftarkan service worker...");
        const registration = await navigator.serviceWorker.register(
          buildServiceWorkerUrl(),
        );
        console.log("[FCM] Service worker terdaftar:", registration);

        const messaging = await getMessagingInstance();
        console.log("[FCM] Messaging instance:", messaging);
        if (!messaging || isCancelled) {
          console.warn("[FCM] Messaging instance null, berhenti di sini.");
          return;
        }

        console.log(
          "[FCM] Meminta token, VAPID key ada?:",
          Boolean(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY),
        );
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        console.log("[FCM] Token didapat:", token);

        if (!token || isCancelled) return;

        const previousToken = window.localStorage.getItem(
          FCM_TOKEN_STORAGE_KEY,
        );
        if (previousToken !== token) {
          console.log("[FCM] Mengirim token ke backend...");
          await api.post("/device-tokens", { token, platform: "web" });
          console.log("[FCM] Token berhasil dikirim ke backend.");
          window.localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
        } else {
          console.log(
            "[FCM] Token sama seperti sebelumnya, tidak dikirim ulang.",
          );
        }

        unsubscribeOnMessage = onMessage(messaging, (payload) => {
          console.log("[FCM] Pesan diterima (foreground):", payload);
          showPersistentQueueAlert(
            payload.notification?.title || "Antrean Anda Segera Tiba",
            payload.notification?.body || "",
          );
        });
      } catch (error) {
        console.error("[FCM] Error saat registrasi:", error);
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
