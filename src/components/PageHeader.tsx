import { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-white/95 px-6 pb-4 pt-6 backdrop-blur">
      <div>
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-accent)]">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-xl font-semibold text-[var(--color-primary)]">
          {title}
        </h1>
      </div>
      {action}
    </div>
  );
}
