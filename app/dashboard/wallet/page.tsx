"use client";
import { Clipboard } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import ApHomeHeader from "@/components/homeHeader";
import { createVirtualAccount, getVirtualAccounts } from "@/redux/features/wallet/walletSlice";
import Image from "next/image";
import { ApButton } from "@/components/button/button";
import { banksInfo } from "@/constants/data";

export default function WalletCard() {
  const [copied, setCopied] = useState(false);
  const [loadingBank, setLoadingBank] = useState<string | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);
  const { accounts } = useSelector((state: RootState) => state.wallets);
  const dispatch = useDispatch<AppDispatch>();

  const normalize = (v: string) => String(v || "").trim().toLowerCase();
  const hasAccountForBank = (bankCode: string) => {
    const code = normalize(bankCode);
    return accounts?.some((acc) => normalize(acc.bankName).includes(code));
  };

  const bankLogoFor = (bankName: string) => {
    const name = normalize(bankName);
    const match = banksInfo.find((b: any) => name.includes(normalize(b.bank)));
    return match?.logo || null;
  };

  const bankThemeFor = (bankNameOrCode: string) => {
    const n = normalize(bankNameOrCode);

    if (n.includes("palmpay")) {
      return {
        from: "#0ea35a",
        to: "#064e3b",
        glow: "rgba(16,185,129,0.35)",
        chipBg: "rgba(16,185,129,0.18)",
        chipText: "rgba(236,253,245,0.95)",
      };
    }

    if (n.includes("9psb") || n.includes("9 psb")) {
      return {
        from: "#2563eb",
        to: "#0b1220",
        glow: "rgba(37,99,235,0.35)",
        chipBg: "rgba(59,130,246,0.18)",
        chipText: "rgba(239,246,255,0.95)",
      };
    }

    return {
      from: "var(--brand-600)",
      to: "var(--brand-700)",
      glow: "rgba(15,23,42,0.35)",
      chipBg: "rgba(255,255,255,0.12)",
      chipText: "rgba(255,255,255,0.92)",
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleGenerateAccount = async (bank: string) => {
    if (!user) return;
    setLoadingBank(bank);
    const reference = `VA-${Date.now()}-${bank}`;

    try {
      await dispatch(
        createVirtualAccount({
          userId: user._id,
          email: user.email,
          reference,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          bank,
        })
      ).unwrap();
      // After success, re-fetch updated accounts
      await dispatch(getVirtualAccounts(user._id));
    } catch (err) {
      console.error(`Failed to generate ${bank} account`, err);
    } finally {
      setLoadingBank(null);
    }
  };

  useEffect(() => {
    if (user?._id) {
      dispatch(getVirtualAccounts(user._id));
    }
  }, [user?._id, dispatch]);



  return (
    <div>
      {/* <ApHomeHeader /> */}

      {/* <div className="px-4">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Virtual Accounts</h2>
            <p className="text-xs text-slate-500">Generate a bank account to fund your wallet.</p>
          </div>
          <div className="text-xs font-semibold text-slate-600">{accounts?.length || 0} created</div>
        </div>
      </div> */}

      <div className="flex flex-wrap gap-4 bg-slate-50 p-4">
        {banksInfo
          .filter((bank: any) => !hasAccountForBank(bank.bank))
          .map((bank: any, index: number) => {
            const theme = bankThemeFor(bank.bank);
            return (
              <div
                key={index}
                className="relative w-96 overflow-hidden rounded-2xl p-5 text-white shadow-lg ring-1 ring-white/10"
                style={{
                  background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
                  boxShadow: `0 18px 45px ${theme.glow}`,
                }}
              >
                <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-white/12 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-14 h-44 w-44 rounded-full bg-black/15 blur-2xl" />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-white/75">Bank</div>
                    <div className="truncate text-base font-semibold">{bank.name || bank.bank}</div>
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/15">
                    <Image src={bank.logo as string} alt={bank.bank} className="h-8 w-8" width={32} height={32} />
                  </div>
                </div>

                <div className="relative mt-5">
                  <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur-sm">
                    <div className="text-xs font-semibold text-white/80">What you get</div>
                    <div className="mt-1 text-sm text-white/90">{bank.note}</div>
                    <div className="mt-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: theme.chipBg, color: theme.chipText }}>
                      Instant funding
                    </div>
                  </div>
                </div>

                <div className="relative mt-4 flex justify-end">
                  <ApButton onClick={() => handleGenerateAccount(bank.bank)} title={loadingBank === bank.bank ? "Generating..." : "Generate"} />
                </div>
              </div>
            );
          })}
      </div>

      <div className="flex flex-wrap gap-4 bg-slate-50 p-4">
        {accounts?.map((acc, index) => {
          const theme = bankThemeFor(acc.bankName);
          return (
            <div
              key={index}
              className="relative w-96 overflow-hidden rounded-2xl p-5 text-white shadow-lg ring-1 ring-white/10"
              style={{
                background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
                boxShadow: `0 18px 45px ${theme.glow}`,
              }}
            >
              <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-white/12 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-14 h-44 w-44 rounded-full bg-black/15 blur-2xl" />

              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-white/75">Bank</div>
                  <div className="truncate text-base font-semibold">{acc.bankName}</div>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/15">
                  <Image
                    src={bankLogoFor(acc.bankName) || banksInfo?.[0]?.logo}
                    alt={acc.bankName}
                    className="h-8 w-8"
                    width={32}
                    height={32}
                  />
                </div>
              </div>

              <div className="relative mt-5 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur-sm">
                <div className="text-xs text-white/75">Account name</div>
                <div className="mt-1 truncate text-sm font-semibold text-white">{acc.accountName}</div>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-white/75">Account number</div>
                    <div className="mt-1 text-lg font-extrabold tracking-wider text-white">{acc.accountNumber}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(acc.accountNumber)}
                    className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition"
                    aria-label="Copy account number"
                  >
                    <Clipboard size={20} />
                  </button>
                </div>
              </div>

              {copied && <div className="absolute bottom-4 right-4 rounded-md bg-black/55 px-3 py-1 text-xs text-white">Copied!</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
