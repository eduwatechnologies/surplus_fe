import { Suspense } from "react";
import ApLoader from "@/components/loader";
import { VerifyEmailForm } from "./verifyform";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-primary bg-opacity-50">
          <p>Loading...</p>
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
