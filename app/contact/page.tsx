import React from "react";
import HomeLayout from "../homeLayout";

export default function ContactPage() {
  return (
    <HomeLayout>
      <main className="p-6 max-w-4xl mx-auto h-screen">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <p className="text-lg text-gray-700 mb-4">
          Need help or have a question? Reach out to us through any of the
          channels below.
        </p>
        <ul className="text-lg text-gray-700 space-y-2">
          <li>
            Email:{" "}
            <a href="mailto:support@mypayonce.com" className="text-blue-600">
              support@almaleek.com.ng
            </a>
          </li>
          <li>Phone: +234 08162399919</li>
          <li>
            WhatsApp:{" "}
            <a href="https://wa.me/23408162399919" className="brand-text">
              Chat with us
            </a>
          </li>
          <li>Office: 123 Surplus Lane, Lagos, Nigeria</li>
        </ul>
      </main>
    </HomeLayout>
  );
}
