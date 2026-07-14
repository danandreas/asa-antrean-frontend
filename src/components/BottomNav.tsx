"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Ticket, Buildings, UserCircle } from "@phosphor-icons/react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/queue", label: "Antrean", icon: Ticket },
  { href: "/clinics", label: "Poli", icon: Buildings },
  { href: "/profile", label: "Profil", icon: UserCircle },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 border-t border-[var(--color-border)] bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      <ul className="flex items-center justify-between">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="flex flex-col items-center gap-1 rounded-2xl py-2 transition"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                    isActive ? "bg-[var(--color-accent-soft)]" : ""
                  }`}
                >
                  <Icon
                    size={22}
                    weight={isActive ? "fill" : "regular"}
                    color={isActive ? "#FF653F" : "#8B86A3"}
                  />
                </span>
                <span
                  className={`text-[11px] font-medium ${
                    isActive ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"
                  }`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
