"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  UserCircle,
  Envelope,
  LockKey,
  SignOut,
  ShieldCheck,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth-context";
import { api, getApiErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const { data } = await api.put("/auth/profile", { name, email });
      setUser(data.user);
      toast.success("Profil berhasil diperbarui.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingPassword(true);
    try {
      await api.put("/auth/password", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
      });
      toast.success("Kata sandi berhasil diubah.");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirmation("");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Akun" title="Profil saya" />

      <div className="flex flex-col gap-6 px-6">
        <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-surface)] p-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
            <UserCircle size={26} weight="fill" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--color-primary)]">{user?.name}</p>
            <p className="text-xs text-[var(--color-muted)]">{user?.role?.name}</p>
          </div>
        </div>

        <section>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
            <Envelope size={16} /> Data diri
          </h2>
          <form onSubmit={handleProfileSubmit} className="mt-3 flex flex-col gap-3">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)]"
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)]"
            />
            <button
              type="submit"
              disabled={isSavingProfile}
              className="rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSavingProfile ? "Menyimpan..." : "Simpan perubahan"}
            </button>
          </form>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
            <LockKey size={16} /> Ubah kata sandi
          </h2>
          <form onSubmit={handlePasswordSubmit} className="mt-3 flex flex-col gap-3">
            <input
              required
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Kata sandi saat ini"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)]"
            />
            <input
              required
              minLength={8}
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Kata sandi baru"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)]"
            />
            <input
              required
              minLength={8}
              type="password"
              autoComplete="new-password"
              value={newPasswordConfirmation}
              onChange={(e) => setNewPasswordConfirmation(e.target.value)}
              placeholder="Konfirmasi kata sandi baru"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)]"
            />
            <button
              type="submit"
              disabled={isSavingPassword}
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              <ShieldCheck size={16} />
              {isSavingPassword ? "Menyimpan..." : "Ubah kata sandi"}
            </button>
          </form>
        </section>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-danger)]/30 py-3.5 text-sm font-semibold text-[var(--color-danger)]"
        >
          <SignOut size={18} />
          Keluar
        </button>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 sm:rounded-3xl">
            <h3 className="font-display text-lg font-semibold text-[var(--color-primary)]">
              Keluar dari akun?
            </h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Kamu perlu login kembali untuk mengakses antrean.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl border border-[var(--color-border)] py-3 text-sm font-semibold text-[var(--color-primary)]"
              >
                Batal
              </button>
              <button
                onClick={logout}
                className="flex-1 rounded-xl bg-[var(--color-danger)] py-3 text-sm font-semibold text-white"
              >
                Ya, keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
