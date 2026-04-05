import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { CSSProperties } from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle, Clock, Shield, Smartphone, Wifi, Zap } from "lucide-react";

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

type StorefrontData = {
  slug: string;
  normalizedSlug: string;
  brandName: string;
  logoUrl: string | null;
  themeStyle?: CSSProperties;
  supportEmail?: string | null;
  supportPhone?: string | null;
  plans: Array<{
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

const planNetworkLogo = (network: string) => {
  const n = String(network || "").trim().toLowerCase();
  if (n.includes("mtn")) return "/images/mtn.png";
  if (n.includes("airtel")) return "/images/airtel.png";
  if (n.includes("glo")) return "/images/glo.jpg";
  if (n.includes("9mobile") || n.includes("etisalat")) return "/images/9mobile.jpeg";
  return "/images/default.png";
};

const safeNumber = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

async function getStorefrontData(slug: string): Promise<StorefrontData> {
  const normalizedSlug = String(slug || "").trim().toLowerCase();
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
    return {
      slug,
      normalizedSlug,
      brandName: "Merchant",
      logoUrl: null,
      themeStyle: undefined,
      supportEmail: null,
      supportPhone: null,
      plans: [],
    };
  }

  if (!brandingRes.ok) notFound();

  const json = (await brandingRes.json()) as BrandingResponse;
  const d = json?.data || {};
  const brandName = typeof d.brandName === "string" && d.brandName.trim() ? d.brandName : "Merchant";
  const logoUrl = typeof d.logoUrl === "string" && d.logoUrl.trim() ? d.logoUrl : null;
  const primaryColor = typeof d.primaryColor === "string" && d.primaryColor.trim() ? d.primaryColor : null;
  const supportEmail = typeof d.supportEmail === "string" && d.supportEmail.trim() ? d.supportEmail : null;
  const supportPhone = typeof d.supportPhone === "string" && d.supportPhone.trim() ? d.supportPhone : null;

  const plansJson = plansRes.ok ? ((await plansRes.json()) as TenantPlansResponse) : null;
  const plans = plansJson?.data?.plans || [];

  const themeStyle = primaryColor
    ? ({
        ["--brand-600" as any]: primaryColor,
        ["--brand-700" as any]: primaryColor,
      } as CSSProperties)
    : undefined;

  return {
    slug,
    normalizedSlug,
    brandName,
    logoUrl,
    themeStyle,
    supportEmail,
    supportPhone,
    plans,
  };
}

function StorefrontShell({ data }: { data: StorefrontData }) {
  const { slug, brandName, logoUrl, themeStyle, supportEmail, supportPhone, plans } = data;
  const tenantParam = encodeURIComponent(slug);

  const services = [
    {
      title: "Airtime",
      description: "Top up in seconds with instant confirmation.",
      href: "/dashboard/buyAirtime",
      images: ["/images/mtn.png", "/images/airtel.png", "/images/glo.jpg", "/images/9mobile.jpeg"],
      icon: Smartphone,
      tag: "Fast",
    },
    {
      title: "Data",
      description: "Bundles across all networks with receipts.",
      href: "/dashboard/buyData",
      images: ["/images/mtn.png", "/images/airtel.png", "/images/glo.jpg", "/images/9mobile.jpeg"],
      icon: Wifi,
      tag: "Popular",
    },
    {
      title: "Electricity",
      description: "Pay bills and get token delivery instantly.",
      href: "/dashboard/buyElectricity",
      images: ["/images/ikeja.png", "/images/eko.png", "/images/abuja.png", "/images/kano.png"],
      icon: Zap,
      tag: "Instant",
    },
    {
      title: "Cable TV",
      description: "Renew your subscriptions without stress.",
      href: "/dashboard/buyCableTv",
      images: ["/images/dstv.png", "/images/gotv.png", "/images/startimes.png", "/images/showmax.png"],
      icon: CheckCircle,
      tag: "Secure",
    },
    {
      title: "Exams",
      description: "Buy exam pins and vouchers safely.",
      href: "/dashboard/buyExam",
      images: ["/images/waec.png", "/images/neco.png", "/images/nabteb.png", "/images/default.png"],
      icon: Shield,
      tag: "Trusted",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900" style={themeStyle}>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/m/${encodeURIComponent(slug)}`} className="flex items-center gap-3">
            {logoUrl ? (
              <div className="h-9 w-9 overflow-hidden rounded-lg border border-slate-200 bg-white">
                <img src={logoUrl} alt={brandName} className="h-full w-full object-contain" />
              </div>
            ) : (
              <div className="h-9 w-9 overflow-hidden rounded-lg border border-slate-200 bg-white">
                <Image src="/images/logo.png" alt={brandName} width={36} height={36} className="h-full w-full object-contain" />
              </div>
            )}
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">{brandName}</div>
              <div className="text-xs text-slate-500">VTU Storefront</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#services" className="text-slate-600 hover:text-slate-900 transition-colors">
              Services
            </a>
            <a href="#plans" className="text-slate-600 hover:text-slate-900 transition-colors">
              Plans
            </a>
            {(supportEmail || supportPhone) && (
              <a href="#support" className="text-slate-600 hover:text-slate-900 transition-colors">
                Support
              </a>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={`/auth/signin?tenant=${tenantParam}`}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign in
            </Link>
            <Link
              href={`/auth/signup?tenant=${tenantParam}`}
              className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm"
              style={{ backgroundColor: "var(--brand-600)" }}
            >
              Create account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[color:var(--brand-50)] to-white">
        <div className="absolute inset-0">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[color:var(--brand-blob-20)] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-44 right-0 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--brand-200)] bg-white/70 px-3 py-1 text-xs font-semibold text-[color:var(--brand-700)]">
                <Clock className="h-4 w-4" />
                Instant delivery • Secure receipts
              </div>

              <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Buy airtime, data, and bills from <span className="brand-text-strong">{brandName}</span>.
              </h1>
              <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg lg:mx-0">
                Fast checkout, instant receipts, and reliable fulfillment. Create an account to start purchasing from this storefront.
              </p>

              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href={`/auth/signup?tenant=${tenantParam}`}
                  className="inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-sm sm:w-auto"
                  style={{ backgroundColor: "var(--brand-600)" }}
                >
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href={`/auth/signin?tenant=${tenantParam}`}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
                >
                  Sign in
                </Link>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-3 text-sm text-slate-700 lg:justify-start">
                  <Shield className="h-5 w-5 brand-text" />
                  Safe payments
                </div>
                <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-3 text-sm text-slate-700 lg:justify-start">
                  <Zap className="h-5 w-5 text-amber-600" />
                  Instant tokens
                </div>
                <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-3 text-sm text-slate-700 lg:justify-start">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  Receipts included
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[color:var(--brand-blob-60)] via-white to-sky-200/60 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">Available services</div>
                    <div className="text-xs font-semibold text-[color:var(--brand-700)]">Powered by {brandName}</div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[
                      { label: "Airtime", img: "/images/mtn.png" },
                      { label: "Data", img: "/images/airtel.png" },
                      { label: "Electricity", img: "/images/ikeja.png" },
                      { label: "TV", img: "/images/dstv.png" },
                      { label: "Exams", img: "/images/waec.png" },
                      { label: "More", img: "/images/logo.png" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <Image src={item.img} alt={item.label} width={40} height={40} className="h-full w-full object-contain" />
                          </div>
                          <div className="text-sm font-semibold text-slate-800">{item.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-900">Quick start</div>
                      <div className="text-xs text-slate-500">Create account → Fund wallet → Buy</div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      {["/images/mtn.png", "/images/airtel.png", "/images/glo.jpg", "/images/9mobile.jpeg"].map((src) => (
                        <div key={src} className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-white">
                          <Image src={src} alt="Network" width={40} height={40} className="h-full w-full object-contain" />
                        </div>
                      ))}
                      <div className="ml-auto text-sm font-semibold text-slate-900">Instant receipts</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Services</h2>
            <p className="mt-3 text-base text-slate-600">Choose what you want to pay for and checkout securely.</p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-[color:var(--brand-200)] bg-[color:var(--brand-50)] px-2 py-1 text-xs font-semibold text-[color:var(--brand-700)]">
                    {s.tag}
                  </span>
                </div>

                <div className="mt-4 text-lg font-semibold text-slate-900">{s.title}</div>
                <div className="mt-2 text-sm text-slate-600">{s.description}</div>

                <div className="mt-5 flex items-center gap-2">
                  {s.images.slice(0, 4).map((src) => (
                    <div key={src} className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-white">
                      <Image src={src} alt={s.title} width={40} height={40} className="h-full w-full object-contain" />
                    </div>
                  ))}
                  <div className="ml-auto inline-flex items-center text-sm font-semibold text-slate-900 group-hover:text-[color:var(--brand-700)]">
                    Buy now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="plans" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Popular Data Plans</h2>
              <p className="mt-1 text-sm text-slate-600">Merchant price vs platform price for transparency.</p>
            </div>
            <Link
              href={`/auth/signup?tenant=${tenantParam}`}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Create account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {plans.length ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {plans.map((p) => {
                const basePrice = safeNumber(p.basePrice);
                const sellingPrice = safeNumber(p.sellingPrice);
                const showBase = basePrice !== null && sellingPrice !== null && basePrice !== sellingPrice;
                const networkLogo = planNetworkLogo(p.network);
                return (
                  <div key={p.planId} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {p.network}
                          {p.validity ? ` • ${p.validity}` : ""}
                        </div>
                      </div>
                      <div className="h-10 w-10 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <Image src={networkLogo} alt={p.network} width={40} height={40} className="h-full w-full object-contain" />
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                      <div className="text-xs font-semibold text-slate-500">Merchant price</div>
                      <div className="mt-1 text-2xl font-bold text-slate-900">{sellingPrice !== null ? `₦${sellingPrice}` : "—"}</div>
                      <div className="mt-1 text-xs text-slate-600">
                        Platform:{" "}
                        {basePrice !== null ? (
                          showBase ? (
                            <span className="font-semibold text-slate-800">₦{basePrice}</span>
                          ) : (
                            <span>₦{basePrice}</span>
                          )
                        ) : (
                          <span>—</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
                <Wifi className="h-6 w-6 brand-text" />
              </div>
              <div className="mt-3 text-sm font-semibold text-slate-900">Plans not available</div>
              <div className="mt-1 text-sm text-slate-600">Try again later or proceed to signup to explore services.</div>
            </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">How it works</h2>
              <p className="mt-3 text-base text-slate-600">
                Create an account, fund your wallet, and buy instantly. Your receipt and history are always available.
              </p>
              <div className="mt-8 grid gap-3">
                {[
                  { n: "1", title: "Create your account", desc: "Sign up to access wallet and checkout." },
                  { n: "2", title: "Fund wallet", desc: "Add money via bank transfer and start purchasing." },
                  { n: "3", title: "Buy & get receipt", desc: "Instant delivery, with transaction history saved." },
                ].map((step) => (
                  <div key={step.n} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold">
                      {step.n}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{step.title}</div>
                      <div className="text-sm text-slate-600">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-8">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Shield, value: "Secure", label: "Payments protected" },
                  { icon: CheckCircle, value: "Instant", label: "Receipt issued" },
                  { icon: Clock, value: "< 1 min", label: "Fast delivery" },
                  { icon: Zap, value: "Reliable", label: "Provider-backed" },
                ].map((stat, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <stat.icon className="h-6 w-6 brand-text" />
                    <div className="mt-3 text-2xl font-bold text-slate-900">{stat.value}</div>
                    <div className="mt-1 text-sm text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-xs text-slate-500">Performance depends on network providers and connectivity.</div>
            </div>
          </div>
        </div>
      </section>

      {(supportEmail || supportPhone) && (
        <section id="support" className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Support</div>
                  <div className="mt-1 text-sm text-slate-600">Need help? Reach out via the channels below.</div>
                </div>
                <div className="h-12 w-12 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <Image src="/images/logo.png" alt="Support" width={48} height={48} className="h-full w-full object-contain" />
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {supportEmail ? (
                  <a
                    href={`mailto:${supportEmail}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                  >
                    Email: <span className="font-medium text-slate-700">{supportEmail}</span>
                  </a>
                ) : null}
                {supportPhone ? (
                  <a
                    href={`tel:${supportPhone}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                  >
                    Phone: <span className="font-medium text-slate-700">{supportPhone}</span>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 px-6 py-12 sm:px-12">
            <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[color:var(--brand-blob-30)] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-500/30 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-3xl font-bold text-white">Ready to purchase?</h2>
                <p className="mt-3 text-slate-200 max-w-xl">
                  Create an account and start buying airtime, data, and bills from {brandName} with instant receipts.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link
                  href={`/auth/signup?tenant=${tenantParam}`}
                  className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                >
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href={`/auth/signin?tenant=${tenantParam}`}
                  className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>

          <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-8 text-sm text-slate-600 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 overflow-hidden rounded-lg border border-slate-200 bg-white">
                <Image src="/images/logo.png" alt="Logo" width={36} height={36} className="h-full w-full object-contain" />
              </div>
              <div>© {new Date().getFullYear()} {brandName}. All rights reserved.</div>
            </div>
            <div className="flex items-center gap-4">
              <a href="#services" className="hover:text-slate-900">Services</a>
              <a href="#plans" className="hover:text-slate-900">Plans</a>
              {(supportEmail || supportPhone) && <a href="#support" className="hover:text-slate-900">Support</a>}
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}

export async function MerchantStorefrontView({ slug }: { slug: string }) {
  const data = await getStorefrontData(slug);
  return <StorefrontShell data={data} />;
}

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

  return <MerchantStorefrontView slug={slug} />;
}
