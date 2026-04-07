"use client";
import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchTransactionById } from "@/redux/features/transaction/transactionSlice";
import ApHeader from "@/components/Apheader";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import ApLoader from "@/components/loader";

function TransactionContent() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("request_id");
  const dispatch = useDispatch<AppDispatch>();
  const { transaction, loading } = useSelector(
    (state: RootState) => state.transactions
  );
  const receiptRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (requestId) {
      dispatch(fetchTransactionById({ _id: requestId }));
    }
  }, [dispatch, requestId]);

  const RenderTrans = ({ title, name }: { title: string; name: string }) => (
    <div className="flex items-start justify-between gap-4 text-sm">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-sm font-semibold text-slate-900 text-right break-words">
        {name}
      </div>
    </div>
  );

  const getStatusUi = (raw: any) => {
    const status = String(raw || "pending").toLowerCase();
    if (status === "success") {
      return {
        label: "SUCCESS",
        title: "Transaction successful",
        icon: <CheckCircle size={44} className="text-white" />,
        pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
        from: "#059669",
        to: "#065f46",
      };
    }
    if (status === "failed") {
      return {
        label: "FAILED",
        title: "Transaction failed",
        icon: <XCircle size={44} className="text-white" />,
        pill: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
        from: "#e11d48",
        to: "#9f1239",
      };
    }
    if (status === "refund" || status === "refunded") {
      return {
        label: "REFUNDED",
        title: "Transaction refunded",
        icon: <CheckCircle size={44} className="text-white" />,
        pill: "bg-[color:var(--brand-50)] text-[color:var(--brand-700)] ring-1 ring-[color:var(--brand-100)]",
        from: "var(--brand-600)",
        to: "var(--brand-700)",
      };
    }
    return {
      label: "PENDING",
      title: "Transaction pending",
      icon: <Clock size={44} className="text-white" />,
      pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
      from: "#f59e0b",
      to: "#b45309",
    };
  };

  const renderServiceFields = () => {
    if (!transaction) return null;

    switch (transaction.service) {
      case "wallet":
        return (
          <>
            <RenderTrans
              title="Transaction Type"
              name={transaction.transaction_type || "N/A"}
            />
          </>
        );

      case "airtime":
        return (
          <>
            <RenderTrans
              title="Network"
              name={transaction.network?.toUpperCase() || "N/A"}
            />
            <RenderTrans title="Phone" name={transaction.mobile_no || "N/A"} />
          </>
        );

      case "data":
        return (
          <>
            <RenderTrans
              title="Network"
              name={transaction.network?.toUpperCase() || "N/A"}
            />
            <RenderTrans title="Phone" name={transaction.mobile_no || "N/A"} />
            <RenderTrans
              title="Data Plan"
              name={transaction.data_type || "N/A"}
            />
          </>
        );

      case "electricity":
        return (
          <>
            <RenderTrans
              title="Meter No"
              name={transaction.meter_no || "N/A"}
            />
            <RenderTrans title="Token" name={transaction.token || "N/A"} />
            <RenderTrans
              title="Customer Name"
              name={transaction.customer_name || "N/A"}
            />
          </>
        );

      case "exam_pin":
        return (
          <>
            <RenderTrans
              title="Pin"
              name={transaction.waec_pin || "N/A"}
            />
          </>
        );

      default:
        return null;
    }
  };

  if (loading) return <ApLoader />;

  if (!transaction) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        <ApHeader title="Transaction Details" />
        <div className="mx-auto w-full max-w-md px-4 pt-8">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-100 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              Transaction not found
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {requestId ? `Request ID: ${requestId}` : "Missing request ID."}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusUi = getStatusUi(transaction?.status);
  const serviceLabel = String(transaction?.service || "—").replaceAll("_", " ");
  const amountText = transaction?.amount
    ? `₦${Number(transaction.amount).toLocaleString()}`
    : "N/A";
  const dateText = transaction?.transaction_date
    ? new Date(transaction.transaction_date).toLocaleString()
    : transaction?.createdAt
      ? new Date(transaction.createdAt).toLocaleString()
      : "N/A";

  return (
    <div className="pb-24">
      <ApHeader title="Transaction Details" />

      <div className="mx-auto w-full max-w-md px-4 pt-6" ref={receiptRef}>
        <div
          className="relative overflow-hidden rounded-3xl p-6 text-white shadow-lg ring-1 ring-white/10"
          style={{
            background: `linear-gradient(135deg, ${statusUi.from}, ${statusUi.to})`,
          }}
        >
          <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-white/12 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-14 h-52 w-52 rounded-full bg-black/20 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                {statusUi.icon}
              </div>
              <div className="min-w-0">
                <div className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  {statusUi.label}
                </div>
                <div className="mt-2 text-base font-semibold">{statusUi.title}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/80">Amount</div>
              <div className="mt-1 text-2xl font-extrabold tracking-tight">{amountText}</div>
            </div>
          </div>

          <div className="relative mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold capitalize">
              {serviceLabel}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              {dateText}
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white/80 p-6 ring-1 ring-slate-100 shadow-sm backdrop-blur space-y-3">
          <div className="text-sm font-semibold text-slate-900">Summary</div>
          <RenderTrans title="Transaction ID" name={transaction?._id || requestId || "N/A"} />
          <RenderTrans title="Reference" name={transaction?.client_reference || transaction?.reference_no || "N/A"} />
        </div>

        <div className="mt-4 rounded-2xl bg-white/80 p-6 ring-1 ring-slate-100 shadow-sm backdrop-blur space-y-3">
          <div className="text-sm font-semibold text-slate-900">Service details</div>
          {renderServiceFields() || <div className="text-xs text-slate-500">No extra details.</div>}
        </div>

        <div className="mt-4 rounded-2xl bg-white/80 p-6 ring-1 ring-slate-100 shadow-sm backdrop-blur space-y-3">
          <div className="text-sm font-semibold text-slate-900">Wallet impact</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <div className="text-xs text-slate-500">Previous</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                ₦{Number(transaction?.previous_balance ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="rounded-2xl bg-[color:var(--brand-50)] p-4 ring-1 ring-[color:var(--brand-100)]">
              <div className="text-xs text-[color:var(--brand-700)]">New</div>
              <div className="mt-1 text-sm font-semibold text-[color:var(--brand-700)]">
                ₦{Number(transaction?.new_balance ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TransactionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <p>Loading transaction details...</p>
        </div>
      }
    >
      <TransactionContent />
    </Suspense>
  );
}
