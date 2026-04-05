"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserTransactions } from "@/redux/features/transaction/transactionSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { Filter, X } from "lucide-react";
import Link from "next/link";
import ApHeader from "@/components/Apheader";
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

  const getStatusBadge = (rawStatus: string) => {
    const status = String(rawStatus || "pending").toLowerCase();
    if (status === "success") {
      return {
        label: "SUCCESS",
        className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
      };
    }
    if (status === "refund" || status === "refunded") {
      return {
        label: "REFUNDED",
        className:
          "bg-[color:var(--brand-50)] text-[color:var(--brand-700)] ring-1 ring-[color:var(--brand-100)]",
      };
    }
    if (status === "failed") {
      return {
        label: "FAILED",
        className: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
      };
    }
    return {
      label: "PENDING",
      className: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    };
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
    <div className="min-h-screen bg-slate-50">
      <ApHeader title="History" />
      <div className="mx-auto w-full max-w-md">
        {/* Search + Filter Bar */}
        <div className="sticky top-0 z-20 bg-white shadow-sm px-3 py-3 flex items-center gap-2">
          <input
            type="text"
            placeholder="Search (service, ref, note...)"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none brand-focus-ring brand-focus-border bg-white"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-3 py-2 bg-slate-100 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            <Filter className="w-4 h-4" />
            Filters{activeFiltersCount ? ` • ${activeFiltersCount}` : ""}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white p-3 shadow-md sticky top-[56px] z-20">
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
                      ? "bg-[color:var(--brand-600)] text-white"
                      : "bg-slate-100 text-slate-700"
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
                      ? "bg-[color:var(--brand-600)] text-white"
                      : "bg-slate-100 text-slate-700"
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
                      ? "bg-[color:var(--brand-600)] text-white"
                      : "bg-slate-100 text-slate-700"
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
          <div className="grid gap-3 px-3 pb-24 pt-4">
            {filteredTransactions.map((trans: any) => {
              const badge = getStatusBadge(trans?.status);
              const amount = Number(trans?.amount || 0);
              const service = String(trans?.service || "—");
              const reference =
                trans?.client_reference || trans?.reference_no || "—";

              return (
                <Link
                  href={`/dashboard/transaction?request_id=${trans?._id}`}
                  key={trans?._id}
                  className="bg-white rounded-2xl p-4 ring-1 ring-slate-100 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs font-semibold text-slate-600 capitalize">
                      {service.replaceAll("_", " ")}
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between gap-3">
                    <div className="text-lg font-extrabold text-[color:var(--brand-700)]">
                      ₦{amount.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {getTxnDate(trans).toLocaleString()}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
                      <div>Reference</div>
                      <div className="font-semibold text-slate-900 break-all text-right">
                        {String(reference)}
                      </div>
                    </div>

                    {trans?.mobile_no ? (
                      <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
                        <div>Phone</div>
                        <div className="font-semibold text-slate-900">
                          {String(trans.mobile_no)}
                        </div>
                      </div>
                    ) : null}
                  </div>
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
