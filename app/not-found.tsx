import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-sm font-semibold text-slate-900">Not found</div>
          <div className="mt-2 text-sm text-slate-600">
            The page you&apos;re looking for doesn&apos;t exist. If you&apos;re trying to open a merchant storefront, use a link like{" "}
            <span className="font-medium text-slate-900">/m/your-merchant</span>.
          </div>
          <div className="mt-4">
            <Link
              href="/m"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Go to merchants
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
