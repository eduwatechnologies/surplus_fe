import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

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

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case "success":
      return <CheckCircle className="w-4 h-4" />;
    case "failed":
      return <XCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

export default function TransactionCard({ trans }: { trans: any }) {
  const status = trans?.status || "Pending";
  const transactionType = trans?.transaction_type || "debit";
  const isCredit = transactionType?.toLowerCase() === "credit";

  return (
    <Link
      href={`/dashboard/transaction?request_id=${trans?._id}`}
      className="bg-white shadow-sm hover:shadow-lg rounded-lg p-4 border border-gray-200 transition-transform duration-200 hover:scale-[1.01]"
    >
      {/* Top Row: Status + Date */}
      <div className="flex justify-between items-center mb-2">
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
            status
          )}`}
        >
          {getStatusIcon(status)}
          <span className="capitalize">{status}</span>
        </div>
        <p className="text-gray-500 text-xs">
          {new Date(trans?.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Amount */}
      <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
        {isCredit ? (
          <ArrowDownRight className="w-5 h-5 text-green-500" />
        ) : (
          <ArrowUpRight className="w-5 h-5 text-red-500" />
        )}
        ₦{Number(trans?.amount ?? 0).toLocaleString()}
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-2 text-sm mt-3">
        <div className="bg-gray-50 p-2 rounded-md">
          <span className="block text-gray-500 text-xs">Previous Balance</span>
          <span className="font-semibold text-gray-900">
            ₦{Number(trans?.previous_balance ?? 0).toLocaleString()}
          </span>
        </div>
        <div className="bg-gray-50 p-2 rounded-md">
          <span className="block text-gray-500 text-xs">New Balance</span>
          <span className="font-semibold text-gray-900">
            ₦{Number(trans?.new_balance ?? 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="mt-3 text-sm text-gray-600">
        <p>
          <span className="font-medium">Service:</span>{" "}
          {trans?.service || "N/A"}
        </p>
        <p className="truncate">
          <span className="font-medium">Reference:</span>{" "}
          {trans?.reference_no || "N/A"}
        </p>
        {trans?.note && (
          <p className="text-gray-500 text-xs mt-1">{trans?.note}</p>
        )}
      </div>
    </Link>
  );
}
