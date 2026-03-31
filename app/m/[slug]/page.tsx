import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { CSSProperties } from "react";

type BrandingResponse = {
  data?: {
    slug?: string;
    brandName?: string | null;
    logoUrl?: string | null;
    primaryColor?: string | null;
    supportEmail?: string | null;
    supportPhone?: string | null;
  };
};

type TenantPlansResponse = {
  data?: {
    tenant?: { slug?: string };
    plans?: Array<{
      planId: string;
      name: string;
      validity: string | null;
      category: string | null;
      serviceType: string;
      network: string;
      basePrice: number | null;
      sellingPrice: number | null;
    }>;
  };
};

export default async function MerchantStorefront({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const h = await headers();
  const rawHost = (h.get("x-forwarded-host") || h.get("host") || "").trim();
  const host = rawHost.split(",")[0].split(":")[0].toLowerCase();
  const proto = (h.get("x-forwarded-proto") || "https").trim();
  const normalizedSlug = String(slug || "").trim().toLowerCase();

  if (host && !host.includes("localhost")) {
    const baseHost = host.startsWith("www.") ? host.slice(4) : host;
    const alreadyOnSubdomain = baseHost.startsWith(`${normalizedSlug}.`);
    const targetHost = alreadyOnSubdomain ? baseHost : `${normalizedSlug}.${baseHost}`;
    redirect(`${proto}://${targetHost}/`);
  }

  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) notFound();

  let brandingRes: Response;
  let plansRes: Response;
  try {
    [brandingRes, plansRes] = await Promise.all([
      fetch(`${base}/api/public/tenant/${encodeURIComponent(slug)}/branding`, { cache: "no-store" }),
      fetch(`${base}/api/public/tenant/${encodeURIComponent(slug)}/plans?serviceType=data&limit=8`, { cache: "no-store" }),
    ]);
  } catch {
    return (
      <main className="min-h-screen bg-white">
        <section className="mx-auto max-w-2xl px-4 py-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-semibold text-slate-900">Storefront temporarily unavailable</div>
            <div className="mt-2 text-sm text-slate-600">
              Could not reach the API server for merchant <span className="font-medium text-slate-900">{normalizedSlug}</span>.
            </div>
            <div className="mt-4 text-xs text-slate-500">
              Check that NEXT_PUBLIC_API_URL is correct and that the backend server is running.
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!brandingRes.ok) notFound();

  const json = (await brandingRes.json()) as BrandingResponse;
  const d = json?.data || {};
  const brandName = (typeof d.brandName === "string" && d.brandName.trim()) ? d.brandName : "Merchant";
  const logoUrl = typeof d.logoUrl === "string" && d.logoUrl.trim() ? d.logoUrl : null;
  const primaryColor = typeof d.primaryColor === "string" && d.primaryColor.trim() ? d.primaryColor : null;

  const plansJson = plansRes.ok ? ((await plansRes.json()) as TenantPlansResponse) : null;
  const plans = plansJson?.data?.plans || [];

  const themeStyle = primaryColor
    ? ({
        ["--brand-600" as any]: primaryColor,
        ["--brand-700" as any]: primaryColor,
      } as CSSProperties)
    : undefined;

  return (
    <main className="min-h-screen bg-white" style={themeStyle}>
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-200 bg-white">
                <img src={logoUrl} alt={brandName} className="h-full w-full object-contain" />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-lg" style={{ backgroundColor: "var(--brand-600)" }} />
            )}
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">{brandName}</div>
              <div className="text-xs text-slate-500">VTU Storefront</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/auth/signin?tenant=${encodeURIComponent(slug)}`}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign in
            </Link>
            <Link
              href={`/auth/signup?tenant=${encodeURIComponent(slug)}`}
              className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--brand-600)" }}
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-semibold text-slate-900">Buy airtime, data, and bills from {brandName}</h1>
          <p className="mt-2 text-sm text-slate-600">
            Fast delivery, instant receipts, and secure payments. Your purchase is fulfilled on the platform, branded for this merchant.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/dashboard/buyAirtime"
              className="rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Airtime
            </Link>
            <Link
              href="/dashboard/buyData"
              className="rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Data
            </Link>
            <Link
              href="/dashboard/buyElectricity"
              className="rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Electricity
            </Link>
            <Link
              href="/dashboard/buyCableTv"
              className="rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Cable TV
            </Link>
          </div>

          {plans.length ? (
            <div className="mt-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Popular Data Plans</div>
                  <div className="text-xs text-slate-500">Merchant price vs platform price</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {plans.map((p) => {
                  const basePrice = typeof p.basePrice === "number" ? p.basePrice : null;
                  const sellingPrice = typeof p.sellingPrice === "number" ? p.sellingPrice : null;
                  const showBase = basePrice !== null && sellingPrice !== null && basePrice !== sellingPrice;
                  return (
                    <div key={p.planId} className="rounded-xl border border-slate-200 p-4">
                      <div className="text-sm font-medium text-slate-900">{p.name}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {p.network}
                        {p.validity ? ` • ${p.validity}` : ""}
                      </div>
                      <div className="mt-3">
                        <div className="text-sm font-semibold text-slate-900">
                          {sellingPrice !== null ? `₦${sellingPrice}` : "—"}
                        </div>
                        {showBase ? (
                          <div className="text-xs text-slate-500">Platform: ₦{basePrice}</div>
                        ) : (
                          <div className="text-xs text-slate-500">Platform: ₦{basePrice ?? "—"}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {(d.supportEmail || d.supportPhone) && (
            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-medium text-slate-900">Support</div>
              {d.supportEmail ? <div>Email: {d.supportEmail}</div> : null}
              {d.supportPhone ? <div>Phone: {d.supportPhone}</div> : null}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
