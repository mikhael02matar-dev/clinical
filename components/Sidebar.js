"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";

const ICONS = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  patients: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6" />
      <circle cx="17.5" cy="9" r="2.6" />
      <path d="M15 14.2c2.6.2 4.6 2.4 4.6 5.8" />
    </svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
    </svg>
  ),
};

export default function Sidebar({ navLinks, addPatientHref, userLabel, accountHref }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = () => setOpen(false);

  return (
    <>
      <div className="mobile-topbar">
        <button className="mobile-menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <span className="mobile-brand">Axis Motion</span>
      </div>

      {open && <div className="sidebar-backdrop" onClick={close} />}

      <aside className={"sidebar" + (open ? " open" : "")}>
        <button className="sidebar-close-btn" onClick={close} aria-label="Close menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div>
          <Link href="/dashboard" className="sidebar-brand" onClick={close}>
            Axis Motion
            <span className="sidebar-brand-sub">CLINICAL MVP</span>
          </Link>

          {navLinks.length > 0 && (
            <nav className="sidebar-nav">
              {navLinks.map((link) => {
                const active =
                  link.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(link.href);
                return (
                  <Link key={link.href} href={link.href} className={active ? "active" : ""} onClick={close}>
                    {ICONS[link.icon]}
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="sidebar-foot">
          {addPatientHref && (
            <Link href={addPatientHref} className="btn sidebar-add-btn" onClick={close}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add New Patient
            </Link>
          )}
          <div className="sidebar-user">{userLabel}</div>
          {accountHref && (
            <Link href={accountHref} className="sidebar-account-link" onClick={close}>
              Account
            </Link>
          )}
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}
