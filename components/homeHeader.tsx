"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { JSX, useEffect, useState } from "react";
import { Sun, Moon, CloudSun, Bell, Settings , } from "lucide-react";
import Link from "next/link";

const ApHomeHeader = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [greeting, setGreeting] = useState<{
    text: string;
    icon: JSX.Element;
  } | null>(null); // Initially null to avoid mismatch

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12)
        return {
          text: "Good Morning",
          icon: <Sun className="text-yellow-500" size={24} />,
        };
      if (hour < 18)
        return {
          text: "Good Afternoon",
          icon: <CloudSun className="text-orange-500" size={24} />,
        };
      return {
        text: "Good Evening",
        icon: <Moon className="text-blue-500" size={24} />,
      };
    };

    setGreeting(getGreeting());

    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const hasNewNotification = true;

  return (


<div className="flex items-center justify-between px-4 py-2 bg-white rounded-xl shadow-sm mb-2">
  {/* Left - Greeting and Name */}
  <div className="flex items-center gap-3">
    <div className="p-2 rounded-full bg-emerald-100 text-emerald-700">
      {greeting?.icon}
    </div>
    <div>
      <h2 className="text-sm text-gray-700 font-medium">{greeting?.text}</h2>
      <p className="text-xs text-gray-500 font-semibold">{user?.firstName || "User"}</p>
    </div>
  </div>

  {/* Right - Settings & Notifications */}
  <div className="flex items-center gap-2">
    <Link
      href="/dashboard/profile"
      className="relative group hover:scale-105 transition-transform"
    >
      <div className="bg-gray-100 p-2 rounded-full">
        <Settings className="text-gray-700" size={20} />
      </div>
    </Link>

    <Link
      href="/dashboard/notification"
      className="relative group hover:scale-105 transition-transform"
    >
      <div className="bg-gray-100 p-2 rounded-full">
        <Bell className="text-gray-700" size={20} />
      </div>
      {hasNewNotification && (
        <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
      )}
    </Link>
  </div>
</div>


  );
};

export default ApHomeHeader;
