"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  Megaphone,
  CheckCircle,
  XCircle,
  Ticket as TicketIcon,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth-context";
import { api, getApiErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { ShimmerList } from "@/components/Shimmer";
import { TicketCard } from "@/components/TicketCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Clinic, QueueTicket } from "@/lib/types";

export default function QueuePage() {
  const { isAdmin } = useAuth();
  return (
    <div>
      <Suspense fallback={<div className="px-6 pt-6"><ShimmerList count={2} /></div>}>
        {isAdmin ? <AdminQueueView /> : <UserQueueView />}
      </Suspense>
    </div>
  );
}

// ---------- Tampilan untuk User: booking + riwayat ----------
function UserQueueView() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [clinicRes, ticketRes] = await Promise.all([
        api.get("/clinics", { params: { active_only: true } }),
        api.get("/queue-tickets/my"),
      ]);
      setClinics(clinicRes.data.data);
      setTickets(ticketRes.data.data);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleBook() {
    if (!selectedClinic) {
      toast.error("Pilih poli terlebih dahulu.");
      return;
    }
    setIsBooking(true);
    try {
      await api.post("/queue-tickets", { clinic_id: selectedClinic });
      toast.success("Booking antrean berhasil.");
      setSelectedClinic(null);
      loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsBooking(false);
    }
  }

  const activeTickets = tickets.filter((t) => ["waiting", "called"].includes(t.status));
  const historyTickets = tickets.filter((t) => ["done", "cancelled"].includes(t.status));

  return (
    <div>
      <PageHeader eyebrow="Antrean" title="Pesan & pantau antrean" />

      <div className="flex flex-col gap-6 px-6">
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-sm font-semibold text-[var(--color-primary)]">Booking antrean baru</p>
          {isLoading ? (
            <div className="mt-3 h-11 animate-pulse rounded-xl bg-white" />
          ) : (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <select
                value={selectedClinic ?? ""}
                onChange={(e) => setSelectedClinic(Number(e.target.value) || null)}
                className="flex-1 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
              >
                <option value="">Pilih poli...</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBook}
                disabled={isBooking}
                className="rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white active:scale-[0.98] disabled:opacity-60"
              >
                {isBooking ? "Memproses..." : "Booking"}
              </button>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-[var(--color-primary)]">Antrean aktif</h2>
          {isLoading ? (
            <div className="mt-3">
              <ShimmerList count={1} />
            </div>
          ) : activeTickets.length === 0 ? (
            <EmptyState text="Belum ada antrean aktif." />
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {activeTickets.map((t) => (
                <TicketCard key={t.id} ticket={t} subtitle={t.clinic?.name} />
              ))}
            </div>
          )}
        </section>

        {historyTickets.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-[var(--color-primary)]">Riwayat</h2>
            <div className="mt-3 flex flex-col gap-2">
              {historyTickets.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--color-primary)]">
                      {t.clinic?.name} · No. {String(t.queue_number).padStart(3, "0")}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {new Date(t.queue_date).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ---------- Tampilan untuk Admin: panggil & kelola ----------
function AdminQueueView() {
  const searchParams = useSearchParams();
  const initialClinicId = searchParams.get("clinic_id");

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<number | null>(
    initialClinicId ? Number(initialClinicId) : null
  );
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalling, setIsCalling] = useState(false);

  useEffect(() => {
    async function loadClinics() {
      try {
        const { data } = await api.get("/clinics", { params: { active_only: true } });
        setClinics(data.data);
        if (!selectedClinic && data.data.length > 0) {
          setSelectedClinic(data.data[0].id);
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error));
      }
    }
    loadClinics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTickets = useCallback(async (clinicId: number) => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/queue-tickets", { params: { clinic_id: clinicId } });
      setTickets(data.data);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClinic) {
      loadTickets(selectedClinic);
    }
  }, [selectedClinic, loadTickets]);

  async function handleCallNext() {
    if (!selectedClinic) return;
    setIsCalling(true);
    try {
      const { data } = await api.post("/queue-tickets/call-next", { clinic_id: selectedClinic });
      toast.success(`Antrean No. ${String(data.data.queue_number).padStart(3, "0")} dipanggil.`);
      loadTickets(selectedClinic);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsCalling(false);
    }
  }

  async function handleUpdateStatus(ticketId: number, status: "done" | "cancelled") {
    try {
      await api.patch(`/queue-tickets/${ticketId}/status`, { status });
      toast.success(status === "done" ? "Antrean ditandai selesai." : "Antrean dibatalkan.");
      if (selectedClinic) loadTickets(selectedClinic);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  const waitingCount = tickets.filter((t) => t.status === "waiting").length;

  return (
    <div>
      <PageHeader eyebrow="Kelola antrean" title="Panggil antrean" />

      <div className="flex flex-col gap-5 px-6">
        <select
          value={selectedClinic ?? ""}
          onChange={(e) => setSelectedClinic(Number(e.target.value))}
          className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
        >
          {clinics.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="rounded-2xl bg-[var(--color-primary)] p-5 text-white">
          <p className="text-xs text-white/70">Menunggu dipanggil</p>
          <p className="font-display mt-1 text-4xl font-bold">{waitingCount}</p>
          <button
            onClick={handleCallNext}
            disabled={isCalling || waitingCount === 0}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] py-3 text-sm font-semibold disabled:opacity-50"
          >
            <Megaphone size={18} weight="fill" />
            {isCalling ? "Memanggil..." : "Panggil antrean berikutnya"}
          </button>
        </div>

        <section>
          <h2 className="text-sm font-semibold text-[var(--color-primary)]">Daftar antrean hari ini</h2>
          {isLoading ? (
            <div className="mt-3">
              <ShimmerList count={3} />
            </div>
          ) : tickets.length === 0 ? (
            <EmptyState text="Belum ada antrean untuk poli ini hari ini." />
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-primary)]">
                      No. {String(t.queue_number).padStart(3, "0")} · {t.user?.name}
                    </p>
                    <StatusBadge status={t.status} />
                  </div>
                  {t.status === "called" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(t.id, "done")}
                        aria-label="Tandai selesai"
                        className="rounded-lg bg-[var(--color-success-soft)] p-2 text-[var(--color-success)]"
                      >
                        <CheckCircle size={18} weight="fill" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(t.id, "cancelled")}
                        aria-label="Batalkan"
                        className="rounded-lg bg-[var(--color-danger-soft)] p-2 text-[var(--color-danger)]"
                      >
                        <XCircle size={18} weight="fill" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-3 rounded-2xl border border-dashed border-[var(--color-border)] p-6 text-center">
      <TicketIcon size={28} className="mx-auto text-[var(--color-muted)]" />
      <p className="mt-2 text-sm text-[var(--color-muted)]">{text}</p>
    </div>
  );
}
