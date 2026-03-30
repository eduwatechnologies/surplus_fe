"use client";
import { ArrowRight, Check, CreditCard, Smartphone, Tv, Wifi, Zap } from "lucide-react";
import Link from "next/link";

export function ServiceSection() {
  const services = [
    {
      icon: Smartphone,
      title: "Airtime Top-up",
      description:
        "Instant airtime for all networks with fast delivery and great rates.",
      features: [
        "All networks",
        "Instant Delivery",
        "Best Rates",
        "24/7 Available",
      ],
      price: "From ₦50",
    },
    {
      icon: Wifi,
      title: "Data Bundles",
      description:
        "Affordable data plans for MTN, Airtel, Glo, and 9mobile.",
      features: [
        "All Data Plans",
        "SME & Gifting",
        "Auto Renewal",
        "Bulk Purchase",
      ],
      price: "From ₦100",
    },
    {
      icon: Zap,
      title: "Utility Bills",
      description:
        "Pay electricity and other utilities with instant confirmation.",
      features: ["PHCN/EKEDC", "Cable TV", "Internet Bills", "Water Bills"],
      price: "No Extra Fee",
    },
    {
      icon: Tv,
      title: "Cable TV",
      description:
        "Subscribe to DSTV, GOTV, Startimes and more in minutes.",
      features: ["DSTV", "GOTV", "Startimes", "Strong Decoder"],
      price: "From ₦1,000",
    },
  ];

  return (
    <section id="services" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Our Services
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
            Everything you need for daily top-ups and bill payments — fast, reliable, and built for scale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-slate-900 text-white shadow-sm">
                  <service.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
                  {service.price}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {service.title}
              </h3>
              <p className="text-sm text-slate-600 mb-5">{service.description}</p>
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center text-sm text-slate-600"
                  >
                    <Check className="w-4 h-4 text-emerald-600 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="inline-flex items-center text-sm font-semibold text-slate-900 group-hover:text-emerald-700">
                Start now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center">
          <Link href="/auth/signup" className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Create a free account
            <CreditCard className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
