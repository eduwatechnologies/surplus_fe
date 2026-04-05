import { Suspense } from "react";
import ApLoader from "@/components/loader";
import SignUpForm from "./signupForm";

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-slate-50">
          <ApLoader />
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
