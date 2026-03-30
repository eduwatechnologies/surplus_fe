import React from "react";
import HomeLayout from "../homeLayout";

export default function AboutPage() {
  return (
    <HomeLayout>
      <main className="p-6 max-w-4xl mx-auto h-screen">
        <h1 className="text-3xl font-bold mb-4">About PayOnce</h1>
        <p className="text-lg text-gray-700">
          PayOnce is Nigeria’s one-stop platform for fast, reliable, and
          affordable VTU services. We offer instant airtime recharge, data
          subscriptions, electricity bill payments, WAEC scratch cards, and more
          — all at your fingertips.
        </p>
      </main>
    </HomeLayout>
  );
}
