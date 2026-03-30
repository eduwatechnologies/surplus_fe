"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
  title: string;
}

const ApHeader: React.FC<HeaderProps> = ({ title }) => {
  const router = useRouter();

  return (
    <header className="flex items-center  bg-white shadow-md">
      <button
        onClick={() => router.back()}
        className="p-2 rounded-full hover:bg-gray-200 transition"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      <h1 className="text-md font-semibold ml-4 ">{title}</h1>
    </header>
  );
};

export default ApHeader;
