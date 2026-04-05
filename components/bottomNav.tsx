"use client";
import { Home, Bell, Clock, User, Wallet2 } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { id: 1, icon: Home, link: "/dashboard", label: "Home" },
    { id: 2, icon: Wallet2, link: "/dashboard/wallet", label: "Wallet" },
  { id: 3, icon: Clock, link: "/dashboard/history", label: "History" },

  // { id: 4, icon: Wallet2, link: "/dashboard/reward", label: "Reward" },
  { id: 4, icon: User, link: "/dashboard/profile", label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-1 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2  shadow-lg flex justify-between items-center border border-gray-200 w-[95%] max-w-[420px] z-50">
      {navItems.map((nav) => {
        const isActive = pathname === nav.link;

        return (
          <Link
            key={nav.id}
            href={nav.link}
            className="flex-1 flex flex-col items-center justify-center text-xs text-gray-500 hover:text-[color:var(--brand-600)] transition"
          >
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full ${
                isActive ? "bg-[color:var(--brand-100)] text-[color:var(--brand-600)]" : "text-gray-500"
              }`}
            >
              <nav.icon size={22} />
            </div>
            <span className={`${isActive ? "text-[color:var(--brand-600)] font-medium" : ""}`}>
              {nav.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
