"use client";
import { BottomNav } from "@/components/bottomNav";
import IdleLogout from "@/components/idleLogout";
import { fetchTenantContext } from "@/redux/features/user/userThunk";
import { AppDispatch, RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const tenantContext = useSelector((state: RootState) => state.auth.tenantContext);

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
        {tenantContext?.brandName || tenantContext?.logoUrl ? (
          <div className="px-6 pt-6 pb-3 flex items-center gap-3">
            {tenantContext?.logoUrl ? (
              <img
                src={tenantContext.logoUrl}
                alt={tenantContext.brandName || "Merchant"}
                className="w-9 h-9 rounded-md object-contain bg-white border"
              />
            ) : null}
            {tenantContext?.brandName ? (
              <div className="text-sm font-semibold text-gray-900">
                {tenantContext.brandName}
              </div>
            ) : null}
          </div>
        ) : null}
        <main className="flex-1 p-6 pt-3">{children}</main>
        <BottomNav />
      </div>
    </IdleLogout>
  );
}
