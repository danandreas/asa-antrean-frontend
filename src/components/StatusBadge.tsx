import { QueueStatus } from "@/lib/types";

const statusConfig: Record<
  QueueStatus,
  { label: string; bg: string; text: string; pulse?: boolean }
> = {
  waiting: { label: "Menunggu", bg: "bg-[var(--color-surface)]", text: "text-[var(--color-muted)]" },
  called: {
    label: "Dipanggil",
    bg: "bg-[var(--color-accent-soft)]",
    text: "text-[var(--color-accent)]",
    pulse: true,
  },
  done: { label: "Selesai", bg: "bg-[var(--color-success-soft)]", text: "text-[var(--color-success)]" },
  cancelled: { label: "Dibatalkan", bg: "bg-[var(--color-danger-soft)]", text: "text-[var(--color-danger)]" },
};

export function StatusBadge({ status }: { status: QueueStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.bg} ${config.text}`}
    >
      {config.pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
        </span>
      )}
      {config.label}
    </span>
  );
}
