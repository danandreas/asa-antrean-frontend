"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Buildings, Plus, PencilSimple, X } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth-context";
import { api, getApiErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { ShimmerBlock } from "@/components/Shimmer";
import { Clinic } from "@/lib/types";

export default function ClinicsPage() {
  const { isAdmin } = useAuth();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);

  const loadClinics = useCallback(async () => {
    try {
      const { data } = await api.get("/clinics");
      setClinics(data.data);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClinics();
  }, [loadClinics]);

  function openCreateForm() {
    setEditingClinic(null);
    setShowForm(true);
  }

  function openEditForm(clinic: Clinic) {
    setEditingClinic(clinic);
    setShowForm(true);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Master data"
        title="Daftar poli"
        action={
          isAdmin && (
            <button
              onClick={openCreateForm}
              aria-label="Tambah poli"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white"
            >
              <Plus size={18} weight="bold" />
            </button>
          )
        }
      />

      <div className="px-6">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <ShimmerBlock className="h-16" />
            <ShimmerBlock className="h-16" />
          </div>
        ) : clinics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-6 text-center">
            <Buildings size={28} className="mx-auto text-[var(--color-muted)]" />
            <p className="mt-2 text-sm text-[var(--color-muted)]">Belum ada poli terdaftar.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {clinics.map((clinic) => (
              <div
                key={clinic.id}
                className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface)]">
                    <Buildings size={20} className="text-[var(--color-primary)]" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-primary)]">{clinic.name}</p>
                    <p className="text-xs text-[var(--color-muted)]">
                      Kode: {clinic.code} ·{" "}
                      <span className={clinic.is_active ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}>
                        {clinic.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </p>
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => openEditForm(clinic)}
                    aria-label={`Edit ${clinic.name}`}
                    className="rounded-lg p-2 text-[var(--color-muted)]"
                  >
                    <PencilSimple size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ClinicFormModal
          clinic={editingClinic}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            loadClinics();
          }}
        />
      )}
    </div>
  );
}

function ClinicFormModal({
  clinic,
  onClose,
  onSaved,
}: {
  clinic: Clinic | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [code, setCode] = useState(clinic?.code ?? "");
  const [name, setName] = useState(clinic?.name ?? "");
  const [isActive, setIsActive] = useState(clinic?.is_active ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (clinic) {
        await api.put(`/clinics/${clinic.id}`, { code, name, is_active: isActive });
        toast.success("Poli berhasil diperbarui.");
      } else {
        await api.post("/clinics", { code, name, is_active: isActive });
        toast.success("Poli berhasil dibuat.");
      }
      onSaved();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-[var(--color-primary)]">
            {clinic ? "Ubah poli" : "Tambah poli"}
          </h3>
          <button onClick={onClose} aria-label="Tutup" className="text-[var(--color-muted)]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--color-primary)]">Kode poli</span>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="mis. gigi"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--color-primary)]">Nama poli</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="mis. Poli Gigi"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-3">
            <span className="text-sm text-[var(--color-primary)]">Poli aktif</span>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5 accent-[var(--color-accent)]"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-2xl bg-[var(--color-accent)] py-3.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </div>
    </div>
  );
}
