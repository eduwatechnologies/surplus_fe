"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { ApTextInput } from "@/components/input/textInput";
import { toast } from "react-toastify";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { requestPasswordReset } from "@/redux/features/user/userThunk";
import { useRouter, useSearchParams } from "next/navigation";
import { ApButton } from "@/components/button/button";
import logo from "@/public/images/logo.png";
import Image from "next/image";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get("tenant") || "";

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const resultAction = await dispatch(requestPasswordReset(values));
      if (requestPasswordReset.fulfilled.match(resultAction)) {
        toast.success("✅ Verification code sent");
        const qp = new URLSearchParams();
        qp.set("email", values.email);
        if (tenantSlug) qp.set("tenant", tenantSlug);
        router.push(`/auth/verify?${qp.toString()}`);
      } else {
        toast.error(`❌ ${resultAction.payload || "Email verification failed"}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl ring-1 ring-slate-100 shadow-lg overflow-hidden">
          <div className="px-6 pt-6 pb-5 [background:linear-gradient(135deg,var(--brand-600),var(--brand-700))] text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center">
                  <Image src={logo} alt="Logo" width={28} height={28} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold leading-tight">
                    Reset password
                  </h2>
                  <p className="text-xs text-white/80">
                    Enter your email to receive a verification code.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-white/80">Step</div>
                <div className="text-sm font-semibold">1 / 3</div>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold ring-1 bg-white text-[color:var(--brand-700)] ring-white/30">
                  1
                </div>
                <div className="flex-1 h-2 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-white/90" style={{ width: "33%" }} />
                </div>
                <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold ring-1 bg-white/10 text-white ring-white/20">
                  2
                </div>
                <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold ring-1 bg-white/10 text-white ring-white/20">
                  3
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-white/80">
                <div>Email</div>
                <div>Verify</div>
                <div>New password</div>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <Formik
              initialValues={{
                email: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-3">
                  <ApTextInput
                    label="Email"
                    name="email"
                    placeHolder="Enter your email"
                  />

                  <ApButton
                    type="submit"
                    className="w-full bg-[color:var(--brand-600)] hover:bg-[color:var(--brand-700)] text-white"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    title={isSubmitting ? "Processing..." : "Continue"}
                  />
                </Form>
              )}
            </Formik>

            <div className="mt-6 flex items-center justify-between text-sm">
              <Link
                href={
                  tenantSlug
                    ? `/auth/signin?tenant=${encodeURIComponent(tenantSlug)}`
                    : "/auth/signin"
                }
                className="text-xs font-semibold text-slate-700 hover:text-slate-900"
              >
                Back to sign in
              </Link>

              <Link
                href={
                  tenantSlug
                    ? `/auth/signup?tenant=${encodeURIComponent(tenantSlug)}`
                    : "/auth/signup"
                }
                className="text-xs font-semibold brand-text hover:underline"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
