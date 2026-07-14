"use client";

import toast, { Toast } from "react-hot-toast";
import { Bell, X } from "@phosphor-icons/react";

export function showPersistentQueueAlert(title: string, body: string) {
  toast.custom(
    (t: Toast) => (
      <div
        className={`flex w-full max-w-sm items-start gap-3 rounded-2xl bg-[var(--color-primary)] p-4 text-white shadow-xl transition ${
          t.visible ? "opacity-100" : "opacity-0"
        }`}
        role="alert"
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)]">
          <Bell size={16} weight="fill" />
        </span>
        <div className="flex-1">
          <p className="font-display text-sm font-semibold">{title}</p>
          <p className="mt-0.5 text-xs text-white/80">{body}</p>
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          aria-label="Tutup notifikasi"
          className="text-white/70"
        >
          <X size={16} />
        </button>
      </div>
    ),
    { duration: Infinity, position: "top-center" }
  );
}
