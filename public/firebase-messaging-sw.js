/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js",
);

// Baca config Firebase dari query string URL registrasi (lihat src/lib/firebase.ts)
const params = new URL(self.location).searchParams;

firebase.initializeApp({
  apiKey: params.get("apiKey"),
  authDomain: params.get("authDomain"),
  projectId: params.get("projectId"),
  storageBucket: params.get("storageBucket"),
  messagingSenderId: params.get("messagingSenderId"),
  appId: params.get("appId"),
});

const messaging = firebase.messaging();

// Notifikasi saat aplikasi di-background / tab tidak fokus
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "ASA Antrean Online";
  const body = payload.notification?.body || "";

  self.registration.showNotification(title, {
    body,
    icon: "/icon.png",
    badge: "/icon.png",
    data: payload.data,
    tag: "pro-queue-antrean",
  });
});

// Saat notifikasi diklik, fokuskan/buka tab aplikasi ke halaman antrean
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) return client.focus();
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow("/queue");
        }
      }),
  );
});
