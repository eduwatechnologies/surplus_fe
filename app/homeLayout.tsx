"use client";
import React from "react";
import { Header } from "./home/header";
import { Footer } from "./home/footer";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
    </div>
  );
}
