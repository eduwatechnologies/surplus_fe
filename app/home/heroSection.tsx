"use client";

import React from "react";
import { ArrowRight, CheckCircle, Headphones, Shield, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import HeroImage from "../../public/images/heroImage1.png";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <div className="absolute inset-0">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Zap className="h-4 w-4" />
              Instant VTU for Nigeria
            </div>

            <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Recharge airtime, buy data, pay bills — in seconds.
            </h1>

            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg lg:mx-0 lg:max-w-2xl">
              A modern VTU experience with fast delivery, transparent pricing, and reliable support. Built for everyday users and resellers.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/auth/signup" className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">
                Get started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/auth/signin" className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Sign in
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-3 text-sm text-slate-700 lg:justify-start">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                Instant delivery
              </div>
              <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-3 text-sm text-slate-700 lg:justify-start">
                <Shield className="h-5 w-5 text-sky-600" />
                Secure payments
              </div>
              <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-3 text-sm text-slate-700 lg:justify-start">
                <Headphones className="h-5 w-5 text-violet-600" />
                24/7 support
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-emerald-200/60 via-white to-sky-200/60 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <Image
                src={HeroImage}
                alt="VTU Dashboard Preview"
                className="h-auto w-full"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
