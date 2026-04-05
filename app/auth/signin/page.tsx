import { Suspense } from "react";
import ApLoader from "@/components/loader";
import SignInForm from "./signinForm";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-slate-50">
          <ApLoader />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
