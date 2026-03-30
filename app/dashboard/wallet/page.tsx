"use client";
import { Clipboard, Banknote } from "lucide-react";
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
      );
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

  const hasAccountForBank = (name: string) => {
    return accounts?.some((acc) => acc.bankName === name);
  };



  return (
    <div>
      <ApHomeHeader />

        {/* ✅ Render Uncreated Banks with Generate Button */}
      <div className="flex flex-wrap gap-4 bg-gray-100 p-4">
        {banksInfo
          .filter((bank: any) => !hasAccountForBank(bank.name))
          .map((bank: any, index: number) => (
            <div
              key={index}
            className="relative w-96 h-56 bg-gradient-to-r from-green-600 to-green-800 rounded-xl shadow-xl p-6 text-white"
            >
              <div className="flex flex-col items-center justify-center">
                <Image
                  src={bank.logo as string}
                  alt={bank.bank}
                  className="w-12 h-12 rounded-full"
                  width={50}
                  height={50}
                />
                <p className="text-center py-2">{bank.note}</p>

                <ApButton
                
                  onClick={() => handleGenerateAccount(bank.bank)}
                  title={loadingBank === bank.bank ? "Generating..." : "Generate"}
                />
              </div>
            </div>
          ))}
      </div>

      {/* ✅ Render Already Created Accounts */}
      <div className="flex flex-wrap gap-4 bg-gray-100 p-4">
        {accounts?.map((acc, index) => (
          <div
            key={index}
            className="relative w-96 h-56 bg-gradient-to-r from-green-600 to-green-800 rounded-xl shadow-xl p-6 text-white"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{acc.bankName}</h2>

                 <Image
                  src={ acc.bankName ===" PALMPAY" ? banksInfo?.[0].logo:banksInfo?.[1].logo}
                  alt={acc.bankName}
                  className="w-12 h-12 rounded-full"
                  width={50}
                  height={50}
                />

              {/* <Banknote size={24} /> */}
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-200">Account Holder</p>
              <h3 className="text-xl font-semibold">{acc.accountName}</h3>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-200">Account Number</p>
                <h3 className="text-lg font-medium tracking-wider">{acc.accountNumber}</h3>
              </div>
              <button
                onClick={() => copyToClipboard(acc.accountNumber)}
                className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition"
              >
                <Clipboard size={20} />
              </button>
            </div>

            {copied && (
              <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-md">
                Copied!
              </div>
            )}
          </div>
        ))}
      </div>

    
    </div>
  );
}
