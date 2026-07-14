export function ShimmerBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[var(--color-surface)] ${className}`}
    />
  );
}

export function ShimmerTicketCard() {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <ShimmerBlock className="h-3 w-24" />
        <ShimmerBlock className="h-5 w-16 rounded-full" />
      </div>
      <ShimmerBlock className="mt-3 h-9 w-20" />
      <ShimmerBlock className="mt-3 h-3 w-32" />
    </div>
  );
}

export function ShimmerList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <ShimmerTicketCard key={i} />
      ))}
    </div>
  );
}
