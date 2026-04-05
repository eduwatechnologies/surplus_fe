import Link from "next/link";
import type { ReactNode } from "react";

export default function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/m" className="text-sm font-bold tracking-tight text-slate-900">
            PayOnce
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
            <Link href="/about" className="hover:text-slate-900">
              About
            </Link>
            <Link href="/contact" className="hover:text-slate-900">
              Contact
            </Link>
            <Link href="/dashboard" className="hover:text-slate-900">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="min-h-[60vh]">{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-slate-600 sm:px-6 lg:px-8">
          <div>© {new Date().getFullYear()} PayOnce</div>
        </div>
      </footer>
    </div>
  );
}
