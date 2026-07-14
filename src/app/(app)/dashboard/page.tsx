"use client";

import { PageHeader } from "@/components/PageHeader";
import { ShimmerList } from "@/components/Shimmer";
import { TicketCard } from "@/components/TicketCard";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Clinic, QueueTicket } from "@/lib/types";
import {
  ArrowRight,
  Buildings,
  ClockCountdown,
  Megaphone,
  ShieldCheck,
  Ticket as TicketIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [myTickets, setMyTickets] = useState<QueueTicket[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);

  useEffect(() => {
    async function load() {
      try {
        if (isAdmin) {
          const { data } = await api.get("/clinics", {
            params: { active_only: true },
          });
          setClinics(data.data);
        } else {
          const { data } = await api.get("/queue-tickets/my");
          setMyTickets(
            data.data.filter((t: QueueTicket) =>
              ["waiting", "called"].includes(t.status),
            ),
          );
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [isAdmin]);

  return (
    <div>
      <PageHeader eyebrow="Selamat datang" title={user?.name ?? ""} />

      <div className="flex flex-col gap-6 px-6">
        <HomeHero
          isAdmin={isAdmin}
          activeCount={isAdmin ? clinics.length : myTickets.length}
        />

        {isAdmin ? (
          <AdminHome isLoading={isLoading} clinics={clinics} />
        ) : (
          <UserHome isLoading={isLoading} tickets={myTickets} />
        )}
      </div>
    </div>
  );
}

function HomeHero({
  isAdmin,
  activeCount,
}: {
  isAdmin: boolean;
  activeCount: number;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[var(--color-primary)] p-5">
      <div className="relative z-10 max-w-[62%]">
        <p className="font-display text-lg font-semibold leading-snug text-white">
          {isAdmin ? "Kelola antrean hari ini" : "Sistem Antrean Online"}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-white/70">
          {isAdmin
            ? "Pantau jumlah user, panggil antrean berikutnya, dan kelola datanya."
            : "Pesan nomor antrean, dapat notifikasi otomatis saat giliranmu hampir tiba."}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white">
            {isAdmin ? <Buildings size={13} /> : <ClockCountdown size={13} />}
            {isAdmin
              ? `${activeCount} poli aktif`
              : `${activeCount} antrean aktif`}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white">
            <ShieldCheck size={13} />
            Real-time
          </span>
        </div>
      </div>

      <Image
        src="/hero-antrean.png"
        alt="Ilustrasi pasien mengantre secara online"
        width={160}
        height={160}
        priority
        className="pointer-events-none absolute -right-4 bottom-0 select-none"
      />
    </section>
  );
}

function UserHome({
  isLoading,
  tickets,
}: {
  isLoading: boolean;
  tickets: QueueTicket[];
}) {
  if (isLoading) return <ShimmerList count={2} />;

  return (
    <>
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-primary)]">
            Antrean aktif kamu
          </h2>
          <Link
            href="/queue"
            className="flex items-center gap-1 text-xs font-medium text-[var(--color-accent)]"
          >
            Semua <ArrowRight size={14} />
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-[var(--color-border)] p-6 text-center">
            <TicketIcon
              size={28}
              className="mx-auto text-[var(--color-muted)]"
            />
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Belum ada antrean aktif. Pesan nomor antrean di tab Antrean.
            </p>
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {tickets.map((t) => (
              <TicketCard key={t.id} ticket={t} subtitle={t.clinic?.name} />
            ))}
          </div>
        )}
      </section>

      <Link
        href="/queue"
        className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/20 active:scale-[0.98]"
      >
        <TicketIcon size={18} weight="fill" color="#FF653F" />
        Pesan antrean baru
      </Link>
    </>
  );
}

function AdminHome({
  isLoading,
  clinics,
}: {
  isLoading: boolean;
  clinics: Clinic[];
}) {
  if (isLoading) return <ShimmerList count={2} />;

  return (
    <section>
      <h2 className="text-sm font-semibold text-[var(--color-primary)]">
        Poli aktif
      </h2>
      <p className="mt-1 text-xs text-[var(--color-muted)]">
        Pilih poli untuk memanggil dan mengelola antrean hari ini.
      </p>

      {clinics.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-[var(--color-border)] p-6 text-center">
          <Buildings size={28} className="mx-auto text-[var(--color-muted)]" />
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Belum ada poli aktif. Tambahkan di tab Poli.
          </p>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {clinics.map((clinic) => (
            <Link
              key={clinic.id}
              href={`/queue?clinic_id=${clinic.id}`}
              className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface)]">
                  <Megaphone
                    size={20}
                    className="text-[var(--color-primary)]"
                  />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-primary)]">
                    {clinic.name}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    Kelola antrean poli ini
                  </p>
                </div>
              </div>
              <ArrowRight size={16} className="text-[var(--color-muted)]" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
