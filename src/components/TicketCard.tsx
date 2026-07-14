import { QueueTicket } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function TicketCard({
  ticket,
  subtitle,
}: {
  ticket: QueueTicket;
  subtitle?: string;
}) {
  return (
    <div
      className="ticket-stub overflow-hidden border border-[var(--color-border)] shadow-sm"
      style={{ ["--stub-notch" as string]: "84px" }}
    >
      <div className="flex items-start justify-between p-4">
        <div>
          <p className="text-xs font-medium text-[var(--color-muted)]">
            {ticket.clinic?.name ?? "Poli"}
          </p>
          <p className="font-display mt-1 text-4xl font-bold text-[var(--color-primary)]">
            {String(ticket.queue_number).padStart(3, "0")}
          </p>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <div className="ticket-stub-divider mx-4" />

      <div className="flex items-center justify-between px-4 py-3 text-xs text-[var(--color-muted)]">
        <span>{formatDate(ticket.queue_date)}</span>
        <span>{subtitle ?? (ticket.user?.name || "")}</span>
      </div>
    </div>
  );
}
