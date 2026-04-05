import { Suspense } from "react";
import ApLoader from "@/components/loader";
import ForgotPasswordForm from "./forgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-slate-50">
          <ApLoader />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
