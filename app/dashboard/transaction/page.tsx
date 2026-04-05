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
        icon: <CheckCircle size={40} className="text-emerald-600" />,
        pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
      };
    }
    if (status === "failed") {
      return {
        label: "FAILED",
        title: "Transaction failed",
        icon: <XCircle size={40} className="text-rose-600" />,
        pill: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
      };
    }
    if (status === "refund" || status === "refunded") {
      return {
        label: "REFUNDED",
        title: "Transaction refunded",
        icon: <CheckCircle size={40} className="text-[color:var(--brand-700)]" />,
        pill: "bg-[color:var(--brand-50)] text-[color:var(--brand-700)] ring-1 ring-[color:var(--brand-100)]",
      };
    }
    return {
      label: "PENDING",
      title: "Transaction pending",
      icon: <Clock size={40} className="text-amber-600" />,
      pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
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
    <div className="min-h-screen bg-slate-50 pb-24">
      <ApHeader title="Transaction Details" />

      <div className="mx-auto w-full max-w-md px-4 pt-6" ref={receiptRef}>
        <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-100 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                {statusUi.icon}
              </div>
              <div>
                <div
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusUi.pill}`}
                >
                  {statusUi.label}
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {statusUi.title}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Amount</div>
              <div className="text-lg font-extrabold text-[color:var(--brand-700)]">
                {amountText}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 capitalize">
              {serviceLabel}
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-6 ring-1 ring-slate-100 shadow-sm space-y-3">
          <RenderTrans
            title="Transaction ID"
            name={transaction?._id || requestId || "N/A"}
          />
          <RenderTrans
            title="Reference"
            name={
              transaction?.client_reference || transaction?.reference_no || "N/A"
            }
          />
          <RenderTrans title="Date" name={dateText} />
        </div>

        <div className="mt-4 rounded-2xl bg-white p-6 ring-1 ring-slate-100 shadow-sm space-y-3">
          <div className="text-sm font-semibold text-slate-900">
            Service details
          </div>
          {renderServiceFields() || (
            <div className="text-xs text-slate-500">No extra details.</div>
          )}
        </div>

        <div className="mt-4 rounded-2xl bg-white p-6 ring-1 ring-slate-100 shadow-sm space-y-3">
          <div className="text-sm font-semibold text-slate-900">
            Wallet impact
          </div>
          <RenderTrans
            title="Previous Balance"
            name={`₦${Number(transaction?.previous_balance ?? 0).toLocaleString()}`}
          />
          <RenderTrans
            title="New Balance"
            name={`₦${Number(transaction?.new_balance ?? 0).toLocaleString()}`}
          />
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
