"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import ApHomeHeader from "@/components/homeHeader";

export default function Profile() {
  const { user } = useSelector((state: RootState) => state.auth);

  const [referralCode] = useState(user?.referralCode || "YOUR_REFERRAL_CODE");
  const referralLink = `https://www.almaleek.com.ng/auth/signup?ref=${referralCode}`;
  const router = useRouter();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied!");
  };

  return (
    <div className="">
      <ApHomeHeader />

      <div className="bg-white shadow-lg rounded-xl p-6 mt-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-gray-800">Refer & Earn</h2>
        <p className="text-gray-600 mt-1">Invite friends & earn rewards.</p>

        {/* Referral Code */}
        <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg mt-4">
          <span className="text-gray-800 font-semibold">{referralCode}</span>
          <button
            onClick={copyToClipboard}
            className="bg-blue-500 text-white px-3 py-1 text-sm rounded-lg"
          >
            Copy
          </button>
        </div>

        {/* Invite Link */}
        <div className="mt-4">
          <p className="text-sm text-gray-500">Your Invite Link:</p>
          <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg mt-1">
            <span className="text-sm text-gray-700 truncate">
              {referralLink}
            </span>
            <button
              onClick={copyToClipboard}
              className="bg-blue-500 text-white px-3 py-1 text-sm rounded-lg"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Earnings */}
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-center">
          Earn up to <span className="font-bold">₦500</span> per referral!
        </div>

        {/* Share Button */}
        <button
          className="mt-4 bg-blue-600 text-white w-full py-2 rounded-lg font-semibold"
          onClick={() => alert("Share feature coming soon!")}
        >
          Share Invite
        </button>
      </div>
    </div>
  );
}
