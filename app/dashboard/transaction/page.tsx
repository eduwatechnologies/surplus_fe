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
    <div className="flex justify-between text-sm md:text-base">
      <p className="font-medium">{title}</p>
      <p>{name}</p>
    </div>
  );

  const renderServiceFields = () => {
    if (!transaction) return null;

    switch (transaction.service) {
      case "wallet":
        return (
          <>
            <RenderTrans
              title="Transaction Type:"
              name={transaction.transaction_type || "N/A"}
            />

            {/* <RenderTrans title="Note:" name={transaction.note || "N/A"} /> */}
          </>
        );

      case "airtime":
        return (
          <>
            <RenderTrans
              title="Network:"
              name={transaction.network?.toUpperCase() || "N/A"}
            />
            <RenderTrans title="Phone:" name={transaction.mobile_no || "N/A"} />
          </>
        );

      case "data":
        return (
          <>
            <RenderTrans
              title="Network:"
              name={transaction.network?.toUpperCase() || "N/A"}
            />
            <RenderTrans title="Phone:" name={transaction.mobile_no || "N/A"} />
            <RenderTrans
              title="Data Plan:"
              name={transaction.data_type || "N/A"}
            />
          </>
        );

      case "electricity":
        return (
          <>
            <RenderTrans
              title="Meter No:"
              name={transaction.meter_no || "N/A"}
            />
            <RenderTrans title="Token:" name={transaction.token || "N/A"} />
            <RenderTrans
              title="Customer Name:"
              name={transaction.customer_name || "N/A"}
            />
          </>
        );

      case "exam_pin":
        return (
          <>
            <RenderTrans
              title="Pin:"
              name={transaction.waec_pin || "N/A"}
            />
           
          </>
        );

      default:
        return null;
    }
  };

  if (loading) return <ApLoader />;

  return (
    <div className="mb-20">
      <ApHeader title="Transaction Details" />

      <div
        className="mt-6 bg-white p-6 rounded-lg shadow-xl max-w-4xl mx-auto"
        ref={receiptRef}
      >
        {/* Status Section */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-2">
            {transaction?.status === "success" && (
              <div className="flex flex-col items-center">
                <CheckCircle size={40} className="text-green-600" />
                <p className="font-semibold text-xl text-green-700">
                  Transaction Successful
                </p>
              </div>
            )}

            {transaction?.status === "pending" && (
              <div className="flex flex-col items-center">
                <Clock size={40} className="text-yellow-600" />
                <p className="font-semibold text-xl text-yellow-700">
                  Transaction Pending
                </p>
              </div>
            )}

            {transaction?.status === "failed" && (
              <div className="flex flex-col items-center">
                <XCircle size={40} className="text-red-600" />
                <p className="font-semibold text-xl text-red-700">
                  Transaction Failed
                </p>
              </div>
            )}
          </div>

          {/* Badge for Service Type */}
          <span className="px-3 py-1 bg-gray-100 text-sm rounded-full capitalize">
            {transaction?.service || "N/A"}
          </span>

          {/* Description */}
          <p className="text-center text-sm text-gray-600">
            Thank you for choosing our service! We appreciate your trust and
            look forward to serving you again.
          </p>

          {/* Common Transaction Details */}
          <div className="w-full mt-4 space-y-4">
            <RenderTrans
              title="Ref_No:"
              name={
                transaction?.client_reference ||
                transaction?.reference_no ||
                "N/A"
              }
            />
            <RenderTrans
              title="Amount:"
              name={
                transaction?.amount
                  ? `₦${transaction.amount.toLocaleString()}`
                  : "N/A"
              }
            />
            <RenderTrans
              title="Date:"
              name={
                transaction?.transaction_date
                  ? new Date(transaction.transaction_date).toLocaleString()
                  : "N/A"
              }
            />

            {/* Service Specific Fields */}
            {renderServiceFields()}

            <RenderTrans
              title="Previous Balance:"
              name={`₦${transaction?.previous_balance ?? 0}`}
            />
            <RenderTrans
              title="New Balance:"
              name={`₦${transaction?.new_balance ?? 0}`}
            />
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
