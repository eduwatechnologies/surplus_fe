"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserTransactions } from "@/redux/features/transaction/transactionSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { Filter, X } from "lucide-react";
import Link from "next/link";
import ApHomeHeader from "@/components/homeHeader";
import ApLoader from "@/components/loader";
import { EmptyTransaction } from "@/components/empty";

export default function HistoryPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, loading } = useSelector(
    (state: RootState) => state.transactions
  );

  const [statusFilter, setStatusFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchUserTransactions());
  }, [dispatch]);

  // --- helpers ---
  const getTxnDate = (t: any) =>
    t?.transaction_date ? new Date(t.transaction_date) : new Date(t?.createdAt);

  const withinRange = (d: Date, window: "7days" | "30days" | "") => {
    if (!window) return true;
    const now = Date.now();
    const diffMs = window === "7days" ? 7 : 30;
    const after = new Date(now - diffMs * 24 * 60 * 60 * 1000);
    return d >= after;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
        return "text-green-500 bg-green-100";
         case "refund":
        return "text-green-500 bg-green-100";
      case "failed":
        return "text-red-500 bg-red-100";
      default:
        return "text-yellow-500 bg-yellow-100";
    }
  };

  // Map UI "type" pill to actual `service` values in DB
  const TYPE_TO_SERVICES: Record<string, string[]> = {
    "": [], // All
    airtime: ["airtime"],
    data: ["data"],
    electricity: ["electricity"],
    cable: ["cable_tv"],
    exam: ["exam_pin"],
    wallet: ["wallet"],
    other: ["other"], // special handling below
  };

  const activeFiltersCount =
    (statusFilter ? 1 : 0) +
    (productFilter ? 1 : 0) +
    (dateFilter ? 1 : 0) +
    (transactionTypeFilter ? 1 : 0);

  const reversedTransactions = useMemo(
    () => (transactions || []).slice().reverse(),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    return reversedTransactions.filter((trans: any) => {
      // status
      const statusMatch =
        !statusFilter ||
        trans?.status?.toLowerCase() === statusFilter.toLowerCase();

      // search across many fields
      const haystack = [
        trans?.network,
        trans?.service, // airtime, data, wallet, cable_tv, electricity, exam_pin
        trans?.note,
        trans?.reference_no,
        trans?.mobile_no,
        trans?.company,
        trans?.package,
        trans?.response_data?.data?.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const productMatch =
        !productFilter || haystack.includes(productFilter.toLowerCase());

      // date
      const dt = getTxnDate(trans);
      const dateMatch = withinRange(dt, dateFilter as any);

      // service type
      const service = (trans?.service || "").toLowerCase();
      let typeMatch = true;

      if (transactionTypeFilter && transactionTypeFilter !== "other") {
        const allowed = TYPE_TO_SERVICES[transactionTypeFilter] || [];
        typeMatch = allowed.includes(service);
      } else if (transactionTypeFilter === "other") {
        // not one of the known buckets
        const known = [
          "airtime",
          "data",
          "electricity",
          "cable_tv",
          "exam_pin",
          "wallet",
        ];
        typeMatch = !known.includes(service);
      }

      return statusMatch && productMatch && dateMatch && typeMatch;
    });
  }, [
    reversedTransactions,
    statusFilter,
    productFilter,
    dateFilter,
    transactionTypeFilter,
  ]);

  if (loading) return <ApLoader />;

  return (
    <div>
      <ApHomeHeader />
      <div className="min-h-screen bg-gray-100">
        {/* Search + Filter Bar */}
        <div className="sticky top-0 z-20 bg-white shadow-sm px-3 py-2 flex items-center gap-2">
          <input
            type="text"
            placeholder="Search (service, ref, note...)"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
          >
            <Filter className="w-4 h-4" />
            Filters{activeFiltersCount ? ` • ${activeFiltersCount}` : ""}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white p-3 shadow-md sticky top-[48px] z-20">
            <div className="flex justify-between mb-3">
              <h3 className="font-semibold text-gray-700">
                Filter Transactions
              </h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Status */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {["", "success", "failed", "pending"].map((status) => (
                <button
                  key={status || "all"}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-1 rounded-full text-sm whitespace-nowrap ${
                    statusFilter === status
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {status ? status[0].toUpperCase() + status.slice(1) : "All"}
                </button>
              ))}
            </div>

            {/* Date */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {[
                { label: "All Dates", value: "" },
                { label: "Last 7 Days", value: "7days" },
                { label: "Last 30 Days", value: "30days" },
              ].map((d) => (
                <button
                  key={d.value || "alldates"}
                  onClick={() => setDateFilter(d.value)}
                  className={`px-4 py-1 rounded-full text-sm whitespace-nowrap ${
                    dateFilter === d.value
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Transaction Type (service) */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {[
                { label: "All Types", value: "" },
                { label: "Airtime", value: "airtime" },
                { label: "Data", value: "data" },
                { label: "Electricity", value: "electricity" },
                { label: "Cable TV", value: "cable" }, // maps to cable_tv
                { label: "Exam", value: "exam" }, // maps to exam_pin
                { label: "Wallet", value: "wallet" },
                { label: "Other", value: "other" },
              ].map((t) => (
                <button
                  key={t.value || "alltypes"}
                  onClick={() => setTransactionTypeFilter(t.value)}
                  className={`px-4 py-1 rounded-full text-sm whitespace-nowrap ${
                    transactionTypeFilter === t.value
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Clear All */}
            {(statusFilter ||
              productFilter ||
              dateFilter ||
              transactionTypeFilter) && (
              <button
                onClick={() => {
                  setStatusFilter("");
                  setProductFilter("");
                  setDateFilter("");
                  setTransactionTypeFilter("");
                }}
                className="text-sm text-red-500 mt-3"
              >
                Clear All
              </button>
            )}
          </div>
        )}

        {/* Transaction List */}
        {filteredTransactions?.length > 0 ? (
          <div className="grid gap-4 mb-20 pt-4">
            {filteredTransactions.map((trans: any) => {
              const status = trans?.status || "Pending";
              return (
                <Link
                  href={`/dashboard/transaction?request_id=${trans?._id}`}
                  key={trans?._id}
                  className="bg-white shadow-sm rounded-lg p-4 border border-gray-200 hover:shadow-md transition"
                >
                  {/* Top Row - Status & Type */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-500">
                      {trans?.transaction_type
                        ? trans.transaction_type.charAt(0).toUpperCase() +
                          trans.transaction_type.slice(1)
                        : "Transaction"}
                    </span>
                    <div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        status
                      )}`}
                    >
                      {status}
                    </span>

                    { status === "failed" && ( <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        "success"
                      )}`}
                    >
                      refunded
                    </span>)}
                    </div>

                  </div>

                  {/* Amount */}
                  <div className="text-lg font-bold text-gray-900 mb-3">
                    ₦{Number(trans?.amount || 0).toLocaleString()}
                  </div>

                  {/* Service */}
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Service:</span>{" "}
                    {trans?.service || "N/A"}
                  </p>

                  {/* Reference */}
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Reference:</span>{" "}
                    {trans?.reference_no || "N/A"}
                  </p>

                  {/* Balances */}
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-2">
                    <div>
                      <span className="font-medium">Previous Balance:</span> ₦
                      {Number(trans?.previous_balance ?? 0).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">New Balance:</span> ₦
                      {Number(trans?.new_balance ?? 0).toLocaleString()}
                    </div>
                  </div>

                  {/* Date */}
                  <p className="text-gray-500 text-xs mt-2">
                    {getTxnDate(trans).toLocaleString()}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyTransaction />
        )}
      </div>
    </div>
  );
}
