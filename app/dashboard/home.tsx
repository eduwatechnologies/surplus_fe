"use client";

import {
  Phone,
  Wifi,
  Bolt,
  TrendingUp,
  Grid,
  GraduationCap,
  Tv2,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Receipt,
  Download,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import ApHomeHeader from "../../components/homeHeader";
import { useEffect, useState } from "react";
import { fetchUserTransactions } from "@/redux/features/transaction/transactionSlice";
import { NotificationModal } from "@/components/modal/notificationModal";
import { currentUser } from "@/redux/features/user/userThunk";

export const HomeDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { notification } = useSelector(
    (state: RootState) => state.notifications
  );
  const dispatch = useDispatch<AppDispatch>();

  const { transactions, loading } = useSelector(
    (state: RootState) => state.transactions
  );

  useEffect(() => {
    dispatch(currentUser());
  }, []);

  useEffect(() => {
    dispatch(fetchUserTransactions());
  }, [dispatch]);

  // useEffect(() => {
  //   dispatch(getLatestNotification());
  // }, [dispatch]);

  const [showBalance, setShowBalance] = useState(true);

  const toggleBalance = () => setShowBalance((prev) => !prev);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
        return <CheckCircle className="text-green-500 w-5 h-5" />;
      case "failed":
        return <XCircle className="text-red-500 w-5 h-5" />;
      default:
        return <Clock className="text-yellow-500 w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
        return "text-green-500 bg-green-100";
      case "failed":
        return "text-red-500 bg-red-100";
      default:
        return "text-yellow-500 bg-yellow-100";
    }
  };

  return (
    <div className=" ">
      <ApHomeHeader />

      <div
        className="  bg-gradient-to-br from-green-600 to-green-800 text-white 
    rounded-2xl p-6 shadow-lg 
    ring-1 ring-white/10 mb-6 
    transform-gpu transition-transform duration-200 ease-out 
    hover:scale-[1.01] 
    will-change-transform
    [background:linear-gradient(135deg,#16a34a,#166534)]"
      >
        {/* Wallet balance header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-base font-medium opacity-90">Wallet Balance</h2>
          <button
            onClick={toggleBalance}
            className="p-1 glass-card-sm transition"
          >
            {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Balance value */}
        <p className="text-4xl font-extrabold tracking-wide mt-2">
          {showBalance
            ? `₦${Number(user?.balance ?? 0).toLocaleString()}`
            : "••••••"}
        </p>

        {/* Bonus / Claim section */}
        <div className="grid grid-cols-2 gap-3 mt-6 text-sm">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <TrendingUp size={14} />
            <span>Bonus: ₦{user?.bonus ?? "0.00"}</span>
          </div>
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <TrendingUp size={14} />
            <span>Claim: ₦0.00</span>
          </div>
        </div>

        {/* PalmPay account details */}
        <div className="mt-4 glass-card p-3 text-sm">
          <p className="font-semibold">{user?.account?.bankName as any}</p>
          <div className=" items-center">
            <p className="mt-1 opacity-90">
              <span className="font-bold">Acc No:</span>{" "}
              {user?.account?.accountNumber}
            </p>
            <p className="opacity-90">
              <span className="font-bold">Acc Name:</span>{" "}
              {user?.account?.accountName}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          {
            id: 1,
            icon: <Send size={24} className="text-blue-500" />,
            label: "Send",
            link: "/dashboard/sendMoney",
          },
          {
            id: 2,
            icon: <Download size={24} className="text-green-500" />,
            label: "Receive",
            link: "/dashboard/sendMoney",
          },
          {
            id: 3,
            icon: <Phone size={24} className="text-blue-500" />,
            label: "Airtime",
            link: "/dashboard/buyAirtime",
          },
          {
            id: 4,
            icon: <Wifi size={24} className="text-green-500" />,
            label: "Data",
            link: "/dashboard/buyData",
          },
          {
            id: 5,
            icon: <Bolt size={24} className="text-yellow-500" />,
            label: "Electricity",
            link: "/dashboard/buyElectricity",
          },

          {
            id: 6,
            icon: <GraduationCap size={24} color="blue" />,
            label: "Exam",
            link: "/dashboard/buyExam",
          },
          {
            id: 7,
            icon: <Tv2 size={24} color="red" />,
            label: "TV",
            link: "/dashboard/buyCableTv",
          },
        ].map((action) => (
          <Link
            key={action.id}
            href={action.link}
            className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-md hover:bg-gray-200 transition duration-200"
          >
            {action.icon}
            <span className="mt-2 text-sm text-gray-700 font-medium">
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Transactions
        </h2>
        {loading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin text-gray-500 w-6 h-6" />
          </div>
        ) : transactions.length > 0 ? (
          <>
            <ul className="space-y-4">
              {transactions
                .slice(-2)
                .reverse()
                .map((tx: any, index: number) => (
                  <li key={index} className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-gray-700">
                          {getStatusIcon(tx?.status)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {tx?.product_name}
                        </p>
                        <p className="text-sm font-semibold">
                          {tx?.service.charAt(0).toUpperCase() +
                            tx?.service.slice(1).toLowerCase()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx?.transaction_date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-right font-bold">₦{tx?.amount}</p>
                      <p
                        className={`px-3 py-1 rounded-full text-xs font-semibold text-right ${getStatusColor(
                          tx?.status
                        )}`}
                      >
                        {tx?.status}
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
            <Link
              href="/dashboard/history"
              className="text-sm text-blue-600 mt-1 block text-center"
            >
              See all
            </Link>
          </>
        ) : (
          <div className="text-center py-2">
            <div className="w-16 h-10 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              No Transactions Found
            </p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              Your transaction history will appear here
            </p>
          </div>
        )}
      </div>

      <NotificationModal notification={notification} />
    </div>
  );
};
