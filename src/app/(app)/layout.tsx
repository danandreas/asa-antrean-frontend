"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { BottomNav } from "@/components/BottomNav";
import { useFcmRegistration } from "@/hooks/useFcm";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  // Minta izin notifikasi & daftarkan device token setelah user login
  useFcmRegistration(Boolean(user));

  if (isLoading || !user) {
    return (
      <div className="flex min-h-dvh flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <div className="flex-1 overflow-y-auto pb-4">{children}</div>
      <BottomNav />
    </div>
  );
}
