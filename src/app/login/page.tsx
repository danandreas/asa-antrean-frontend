"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash, EnvelopeSimple, LockKey, Ticket } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);
    if (success) {
      router.replace("/dashboard");
    }
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col justify-between px-6 pb-8 pt-14">
      <div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]">
          <Ticket size={28} weight="fill" color="#FF653F" />
        </div>

        <h1 className="font-display mt-8 text-[28px] font-semibold text-[var(--color-primary)]">
          Masuk ke akun kamu
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Pantau dan pesan antrean poli tanpa perlu berdiri di lorong rumah sakit.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--color-primary)]">Email</span>
            <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 focus-within:border-[var(--color-accent)]">
              <EnvelopeSimple size={18} className="text-[var(--color-muted)]" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="nama@utdi.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-muted)]"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--color-primary)]">Kata sandi</span>
            <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 focus-within:border-[var(--color-accent)]">
              <LockKey size={18} className="text-[var(--color-muted)]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-muted)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="text-[var(--color-muted)]"
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-2xl bg-[var(--color-accent)] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-accent)]/25 transition active:scale-[0.98] disabled:opacity-60"
          >
            {isSubmitting ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-[var(--color-muted)]">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-[var(--color-primary)]">
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}
