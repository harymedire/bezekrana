"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LayoutDashboard, LogOut, Settings, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function UserMenu({
  email,
  fullName,
  isAdmin = false,
}: {
  email: string;
  fullName?: string | null;
  isAdmin?: boolean;
}) {
  const t = useTranslations("nav");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click + Escape
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.replace("/");
    router.refresh();
  }

  // Prefer full name; fall back to first part of email if user hasn't set one.
  const displayName = (fullName && fullName.trim()) || email.split("@")[0];
  // Avatar shows first initial of whichever we display.
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border-2 border-plum-100 bg-white pl-1 pr-3 py-1 hover:border-plum-200 transition"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-plum-600 text-white font-bold text-sm">
          {initial}
        </span>
        <span className="hidden sm:inline text-sm font-bold text-plum-800 max-w-[160px] truncate">
          {displayName}
        </span>
      </button>

      <div
        role="menu"
        className={cn(
          "absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-soft border border-plum-100 py-2 origin-top-right transition",
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none",
        )}
      >
        <MenuLink href="/dashboard" icon={LayoutDashboard} onClick={() => setOpen(false)}>
          {t("dashboard")}
        </MenuLink>
        <MenuLink href="/dashboard/settings" icon={Settings} onClick={() => setOpen(false)}>
          {/* Re-uses the dashboard.settings string */}
          <SettingsLabel />
        </MenuLink>
        {isAdmin && (
          <>
            <div className="my-1 h-px bg-plum-100" />
            <MenuLink href="/admin" icon={ShieldCheck} onClick={() => setOpen(false)}>
              {t("admin")}
            </MenuLink>
          </>
        )}
        <div className="my-1 h-px bg-plum-100" />
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-coral-700 hover:bg-coral-50"
        >
          <LogOut className="h-4 w-4" />
          {t("logout")}
        </button>
      </div>
    </div>
  );
}

function SettingsLabel() {
  const t = useTranslations("dashboard");
  return <>{t("settings")}</>;
}

function MenuLink({
  href,
  icon: Icon,
  onClick,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-plum-800 hover:bg-plum-50"
    >
      <Icon className="h-4 w-4 text-plum-500" />
      {children}
    </Link>
  );
}
