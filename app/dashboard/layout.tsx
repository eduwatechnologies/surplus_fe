"use client";
import { BottomNav } from "@/components/bottomNav";
import IdleLogout from "@/components/idleLogout";
import { fetchTenantContext } from "@/redux/features/user/userThunk";
import { AppDispatch, RootState } from "@/redux/store";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, MessageCircle } from "lucide-react";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const tenantContext = useSelector((state: RootState) => state.auth.tenantContext);
  const { user } = useSelector((state: RootState) => state.auth);

  const applyBrand = (primaryColor: string | null | undefined) => {
    const c = String(primaryColor || "").trim();
    if (!/^#?[0-9a-fA-F]{6}$/.test(c)) return;

    const hex = c.startsWith("#") ? c.slice(1) : c;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
    const mix = (to: { r: number; g: number; b: number }, amount: number) => {
      const a = Math.max(0, Math.min(1, amount));
      return {
        r: clamp(r + (to.r - r) * a),
        g: clamp(g + (to.g - g) * a),
        b: clamp(b + (to.b - b) * a),
      };
    };
    const rgb = (x: { r: number; g: number; b: number }) => `rgb(${x.r}, ${x.g}, ${x.b})`;
    const rgba = (x: { r: number; g: number; b: number }, a: number) =>
      `rgba(${x.r}, ${x.g}, ${x.b}, ${a})`;

    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 0, g: 0, b: 0 };

    const c50 = mix(white, 0.9);
    const c100 = mix(white, 0.8);
    const c200 = mix(white, 0.65);
    const c400 = mix(white, 0.2);
    const c500 = mix(white, 0.1);
    const c600 = { r, g, b };
    const c700 = mix(black, 0.25);

    const root = document.documentElement;
    root.style.setProperty("--brand-50", rgb(c50));
    root.style.setProperty("--brand-100", rgb(c100));
    root.style.setProperty("--brand-200", rgb(c200));
    root.style.setProperty("--brand-400", rgb(c400));
    root.style.setProperty("--brand-500", rgb(c500));
    root.style.setProperty("--brand-600", rgb(c600));
    root.style.setProperty("--brand-700", rgb(c700));
    root.style.setProperty("--brand-blob-30", rgba(c600, 0.3));
    root.style.setProperty("--brand-blob-20", rgba(c400, 0.2));
    root.style.setProperty("--brand-blob-60", rgba(c200, 0.6));
    root.style.setProperty("--brand-glass", rgba(c700, 0.3));
    root.style.setProperty("--brand-glass-strong", rgba(c600, 0.45));
  };

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      router.replace("/auth/signin");
      return;
    }
    dispatch(fetchTenantContext());
  }, [router, dispatch]);

  useEffect(() => {
    applyBrand(tenantContext?.primaryColor);
  }, [tenantContext?.primaryColor]);

  return (
    <IdleLogout>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-[color:var(--brand-50)] to-blue-50 w-full max-w-[420px] mx-auto shadow-lg border">
        <div className="px-6 pt-6 pb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={tenantContext?.logoUrl || "/images/logo.png"}
              alt={tenantContext?.brandName || "Surplus TopUp"}
              className="w-9 h-9 rounded-md object-contain bg-white border"
            />
            <div className="leading-tight">
              {tenantContext?.brandName ? (
                <div className="text-sm font-semibold text-gray-900">{tenantContext.brandName}</div>
              ) : (
                <div className="text-sm font-semibold text-gray-900">Surplus TopUp</div>
              )}
              <div className="text-xs text-gray-600">Hi{user?.firstName ? `, ${user.firstName}` : ""}</div>
            </div>
          </div>
          <Link
            href="/dashboard/notification"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white border hover:bg-gray-50"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-700" />
          </Link>
        </div>
        <main className="flex-1 p-6 pt-3">{children}</main>
        {(() => {
          const showWhatsApp = pathname?.startsWith("/dashboard");
          const digits = String(tenantContext?.supportPhone || "").replace(/\D/g, "");
          const def = "2348063249490";
          const normalized =
            digits && digits.length >= 10
              ? digits.startsWith("0") && digits.length === 11
                ? `234${digits.slice(1)}`
                : digits.startsWith("234")
                ? digits
                : digits
              : def;
          const encodedText = encodeURIComponent(
            `Hello ${tenantContext?.brandName || "Support"}, I need assistance with my account.`
          );
          const href = `https://wa.me/${normalized}?text=${encodedText}`;
          if (!showWhatsApp) return null;
          return (
            <div className="fixed bottom-20 right-6 z-40">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full shadow-lg ring-1 ring-black/10 transition hover:opacity-95"
                style={{ backgroundColor: "#25D366" }}
                aria-label="WhatsApp"
              >
                <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
                  <circle cx="16" cy="16" r="16" fill="#25D366" />
                  <path
                    d="M23.6 8.4A10.2 10.2 0 0 0 6.9 23.5L6 26l2.6-.8a10.2 10.2 0 0 0 15-8.9 10.1 10.1 0 0 0-0.1-7.9Zm-7.6 16.1a8.5 8.5 0 0 1-4.3-1.2l-.3-.2-2.5.7.7-2.4-.2-.3a8.5 8.5 0 1 1 6.6 3.4Zm4.8-6.4c-.3-.1-1.7-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7.1a6.9 6.9 0 0 1-2-1.2 7.6 7.6 0 0 1-1.4-1.8c-.1-.3 0-.5.1-.6s.3-.3.4-.5.3-.3.4-.6 0-.5 0-.6 0-.4-.2-.6-.7-1.8-1-2.4-.6-.6-.8-.6h-.6a1.1 1.1 0 0 0-.8.4 3.2 3.2 0 0 0-1 2.3 5.6 5.6 0 0 0 1.2 2.9 12.8 12.8 0 0 0 4.9 4.7 5.7 5.7 0 0 0 2.8.9 2.8 2.8 0 0 0 1.9-.9 2.4 2.4 0 0 0 .4-1.6c0-.1 0-.2-.1-.3s-.2-.2-.5-.3Z"
                    fill="#fff"
                  />
                </svg>
              </a>
            </div>
          );
        })()}
        <BottomNav />
      </div>
    </IdleLogout>
  );
}
