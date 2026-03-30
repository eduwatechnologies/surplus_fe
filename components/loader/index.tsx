// components/Loader.tsx
"use client";

import Image from "next/image";
import logo from "@/public/images/logo.png"; // update this path based on where your logo is stored

export default function ApLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col justify-center items-center h-screen space-y-4">
      <Image
        src={logo}
        alt="Loading Logo"
        width={50}
        height={50}
        className="animate-scale"
      />
      <p className="text-lg font-semibold text-gray-700">{text}</p>
    </div>
  );
}
