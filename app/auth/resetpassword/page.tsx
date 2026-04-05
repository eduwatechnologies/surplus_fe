import { Suspense } from "react";
import ApLoader from "@/components/loader";

import { ResetPasswordForm } from "./resetpasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-slate-50">
          <ApLoader />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
