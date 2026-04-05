"use client";

import {
  Phone,
  Wifi,
  Bolt,
  GraduationCap,
  Tv2,
  Wallet,
  ArrowUpRight,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Receipt,
  Clipboard,
  ChevronLeft,
  ChevronRight,
  User,
  Gift,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import ApHomeHeader from "../../components/homeHeader";
import { useEffect, useRef, useState } from "react";
import { fetchUserTransactions } from "@/redux/features/transaction/transactionSlice";
import { NotificationModal } from "@/components/modal/notificationModal";
import { currentUser } from "@/redux/features/user/userThunk";
import { getVirtualAccounts } from "@/redux/features/wallet/walletSlice";
import { banksInfo } from "@/constants/data";

export const HomeDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { notification } = useSelector(
    (state: RootState) => state.notifications
  );
  const dispatch = useDispatch<AppDispatch>();

  const { transactions, loading } = useSelector(
    (state: RootState) => state.transactions
  );

  const { accounts, loading: accountsLoading } = useSelector(
    (state: RootState) => state.wallets
  );

  useEffect(() => {
    dispatch(currentUser());
  }, []);

  useEffect(() => {
    dispatch(fetchUserTransactions());
  }, [dispatch]);

  useEffect(() => {
    if (user?._id) {
      dispatch(getVirtualAccounts(user._id));
    }
  }, [dispatch, user?._id]);

  // useEffect(() => {
  //   dispatch(getLatestNotification());
  // }, [dispatch]);

  const [showBalance, setShowBalance] = useState(true);
  const [accountIndex, setAccountIndex] = useState(0);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const accountsScrollRef = useRef<HTMLDivElement | null>(null);

  const toggleBalance = () => setShowBalance((prev) => !prev);

  const scrollToAccountIndex = (idx: number) => {
    const container = accountsScrollRef.current;
    if (!container) return;
    const el = container.querySelector<HTMLElement>(`[data-acc-index="${idx}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  useEffect(() => {
    if (!accounts?.length) return;
    setAccountIndex((i) => {
      const next = Math.min(i, accounts.length - 1);
      requestAnimationFrame(() => scrollToAccountIndex(next));
      return next;
    });
  }, [accounts?.length]);

  useEffect(() => {
    if (!accounts?.length) return;
    const t = setInterval(() => {
      setAccountIndex((i) => {
        const next = (i + 1) % accounts.length;
        requestAnimationFrame(() => scrollToAccountIndex(next));
        return next;
      });
    }, 4500);
    return () => clearInterval(t);
  }, [accounts?.length]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAccount(text);
      setTimeout(() => setCopiedAccount(null), 1600);
    });
  };

  const bankLogoFor = (bankName: string) => {
    const name = String(bankName || "").trim().toLowerCase();
    const palmpay = banksInfo.find((b: any) => String(b.bank || "").toLowerCase().includes("palmpay"));
    const ninepsb = banksInfo.find((b: any) => String(b.bank || "").toLowerCase().includes("9psb"));
    if (name.includes("palmpay")) return palmpay?.logo || null;
    if (name.includes("9psb")) return ninepsb?.logo || null;
    return null;
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
        return <CheckCircle className="brand-text w-5 h-5" />;
      case "failed":
        return <XCircle className="text-red-500 w-5 h-5" />;
      default:
        return <Clock className="text-yellow-500 w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
        return "text-[color:var(--brand-600)] bg-[color:var(--brand-100)]";
      case "failed":
        return "text-red-500 bg-red-100";
      default:
        return "text-yellow-500 bg-yellow-100";
    }
  };

  return (
    <div className=" ">

       <div className=" mb-2 overflow-hidden rounded-2xl border-2 border-[color:var(--brand-200)] bg-[color:var(--brand-50)] shadow-sm">
          <div
            className="flex whitespace-nowrap py-2.5 text-[color:var(--brand-700)] [will-change:transform]"
            style={{ animation: "marq 18s linear infinite" }}
          >
            <span className="inline-flex items-center gap-2 px-5 text-sm font-semibold">
              <Megaphone className="h-4 w-4" />
              Fund your wallet with your virtual account • Instant delivery • Secure checkout • Receipts for every transaction •
              {accounts?.length ? ` ${accounts.length} virtual account${accounts.length > 1 ? "s" : ""} ready` : " Create a virtual account to fund easily"}
            </span>
            <span className="inline-flex items-center gap-2 px-5 text-sm font-semibold">
              <Megaphone className="h-4 w-4" />
              Fund your wallet with your virtual account • Instant delivery • Secure checkout • Receipts for every transaction •
              {accounts?.length ? ` ${accounts.length} virtual account${accounts.length > 1 ? "s" : ""} ready` : " Create a virtual account to fund easily"}
            </span>
          </div>
        </div>

      <div
        className="text-white rounded-2xl p-6 shadow-lg ring-1 ring-white/10 mb-6 transform-gpu transition-transform duration-200 ease-out hover:scale-[1.01] will-change-transform [background:linear-gradient(135deg,var(--brand-600),var(--brand-700))]"
      >
        {/* Wallet balance header */}
        <div className="flex justify-between items-center ">
          <h2 className="text-base font-medium opacity-90">Wallet Balance</h2>
          <button
            onClick={toggleBalance}
            className="p-1 glass-card-sm transition"
          >
            {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Balance value */}
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-extrabold tracking-wide">
              {showBalance
                ? `₦${Number(user?.balance ?? 0).toLocaleString()}`
                : "••••••"}
            </p>
            
          </div>
          <Link
            href="/dashboard/wallet"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/25 transition"
          >
            <Wallet className="h-4 w-4" />
            Fund Wallet
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      

       

        <style jsx>{`
          @keyframes marq {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </div>

      <div className="shadow-md rounded-lg ">
      

        {accountsLoading ? (
          <div className=" animate-pulse rounded-xl bg-gray-100" />
        ) : accounts?.length ? (
          <div className="mt-2">
            <div className="relative rounded-2xl border border-slate-200 ">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent" />

              <div
                ref={accountsScrollRef}
                className="flex snap-x snap-mandatory gap-1 overflow-x-auto scroll-smooth   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {accounts.map((acc: any, idx: number) => {
                  const logo = bankLogoFor(acc.bankName);
                  return (
                    <div
                      key={acc.id || `${acc.bankName}-${acc.accountNumber}`}
                      data-acc-index={idx}
                      className="w-full "
                    >
                      <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-sm [background:linear-gradient(135deg,var(--brand-200),var(--brand-600))]">
                            <div className="text-base items-center font-semibold leading-tight text-center">{acc.bankName}</div>
                             <div className="text-sm font-semibold text-center">{acc.accountName}</div>

                          <div className="flex  justify-center gap-3">
                            <div>
                              
                              <div className="mt-1 text-lg font-extrabold tracking-wider text-center">{acc.accountNumber}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(acc.accountNumber)}
                              className="rounded-full bg-white/15 p-2 hover:bg-white/25 transition"
                              aria-label="Copy account number"
                            >
                              <Clipboard size={18} />
                            </button>
                          </div>
                      </div>
                    </div>
                  );
                })}
              </div>

           
            </div>

            <div className="mt-1 mb-2 flex items-center justify-center gap-2">
              {accounts.map((acc: any, idx: number) => (
                <button
                  key={acc.id || idx}
                  type="button"
                  onClick={() => {
                    setAccountIndex(idx);
                    requestAnimationFrame(() => scrollToAccountIndex(idx));
                  }}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === accountIndex ? "w-7 bg-[color:var(--brand-600)]" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Account ${idx + 1}`}
                />
              ))}
            </div>
            
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-800">No virtual account yet</div>
            <div className="mt-1 text-xs text-gray-500">Create one so you can fund your wallet easily.</div>
            <div className="mt-3">
              <Link href="/dashboard/wallet" className="inline-flex items-center justify-center rounded-md bg-[color:var(--brand-600)] px-4 py-2 text-xs font-semibold text-white">
                Create / view accounts
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Quick Actions</h2>
          <p className="text-xs text-gray-500">Pay bills and top up instantly.</p>
        </div>
        <Link href="/dashboard/history" className="text-xs font-semibold brand-text hover:underline">
          View history
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          {
            id: 3,
            icon: <Phone className="h-5 w-5 text-blue-600" />,
            label: "Airtime",
            hint: "Recharge",
            link: "/dashboard/buyAirtime",
            ring: "ring-blue-100",
            bg: "bg-blue-50",
          },
          {
            id: 4,
            icon: <Wifi className="h-5 w-5 [color:var(--brand-700)]" />,
            label: "Data",
            hint: "Bundles",
            link: "/dashboard/buyData",
            ring: "ring-[color:var(--brand-100)]",
            bg: "bg-[color:var(--brand-50)]",
          },
          {
            id: 5,
            icon: <Bolt className="h-5 w-5 text-amber-600" />,
            label: "Electricity",
            hint: "Token",
            link: "/dashboard/buyElectricity",
            ring: "ring-amber-100",
            bg: "bg-amber-50",
          },
          {
            id: 6,
            icon: <GraduationCap className="h-5 w-5 text-indigo-600" />,
            label: "Exam",
            hint: "Pins",
            link: "/dashboard/buyExam",
            ring: "ring-indigo-100",
            bg: "bg-indigo-50",
          },
          {
            id: 7,
            icon: <Tv2 className="h-5 w-5 text-rose-600" />,
            label: "TV",
            hint: "Subscription",
            link: "/dashboard/buyCableTv",
            ring: "ring-rose-100",
            bg: "bg-rose-50",
          },
          {
            id: 8,
            icon: <User className="h-5 w-5 text-slate-700" />,
            label: "Profile",
            hint: "Account",
            link: "/dashboard/profile",
            ring: "ring-slate-200",
            bg: "bg-slate-50",
          },
          {
            id: 9,
            icon: <Gift className="h-5 w-5 text-emerald-700" />,
            label: "Referral",
            hint: "Earn",
            link: "/dashboard/reward",
            ring: "ring-emerald-100",
            bg: "bg-emerald-50",
          },
        ].map((action) => (
          <Link
            key={action.id}
            href={action.link}
            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 text-gray-300 transition group-hover:text-gray-500" />
            <div className={`grid h-12 w-12 place-items-center rounded-2xl ring-1 ${action.ring} ${action.bg}`}>
              {action.icon}
            </div>
            <div className="mt-2">
              <div className="text-sm font-semibold text-gray-800">{action.label}</div>
              {/* <div className="mt-0.5 text-xs text-gray-500">{action.hint}</div> */}
            </div>
          </Link>
        ))}
      </div>

      <NotificationModal notification={notification} />
    </div>
  );
};
