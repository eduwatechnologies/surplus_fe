"use client";

import { FileText } from "lucide-react";

export function EmptyTransaction() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-slate-100 p-6 rounded-full mb-4">
        <FileText size={48} className="text-slate-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-700">
        No Transactions Yet
      </h2>
      <p className="text-sm text-slate-500 mt-2 max-w-xs">
        You haven't made any transactions yet. When you do they’ll appear here.
      </p>
    </div>
  );
}
