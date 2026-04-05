import Link from "next/link";
import HomeLayout from "../homeLayout";
import GoogleAd from "../googleads";

export default function MerchantsIndexPage() {
  return (
    <HomeLayout>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Open a merchant storefront
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-slate-600">
          Merchant pages use a slug. Visit a link like <span className="font-semibold text-slate-900">/m/your-merchant</span>.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-sm font-semibold text-slate-900">Examples</div>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/m/demo" className="text-slate-700 hover:text-slate-900">
              /m/demo
            </Link>
            <Link href="/m/payonce" className="text-slate-700 hover:text-slate-900">
              /m/payonce
            </Link>
          </div>
          <div className="mt-6 text-xs text-slate-500">
            If a slug doesn&apos;t exist, you&apos;ll see a 404.
          </div>
        </div>

        <div className="mt-10">
          <GoogleAd slot="5872708392333567" />
        </div>
      </section>
    </HomeLayout>
  );
}
