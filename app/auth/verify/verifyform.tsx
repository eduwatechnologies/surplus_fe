"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { ApTextInput } from "@/components/input/textInput";
import { toast } from "react-toastify";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { resendVerificationCode, verifyResetCode } from "@/redux/features/user/userThunk";
import { useRouter, useSearchParams } from "next/navigation";
import { ApButton } from "@/components/button/button";
import { useState } from "react";
import logo from "@/public/images/logo.png";
import Image from "next/image";
import Link from "next/link";

export function VerifyEmailForm() {
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const tenantSlug = searchParams.get("tenant") || "";
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const validationSchema = Yup.object({
    code: Yup.string()
      .matches(/^\d{6}$/, "Enter the 6-digit code")
      .required("Verification code is required"),
  });

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    const resultAction = await dispatch(verifyResetCode(values));
    setIsSubmitting(false);

    if (verifyResetCode.fulfilled.match(resultAction)) {
      toast.success("✅ Email verified successfully");
      const qp = new URLSearchParams();
      qp.set("email", values.email);
      qp.set("code", values.code);
      if (tenantSlug) qp.set("tenant", tenantSlug);
      router.push(`/auth/resetpassword?${qp.toString()}`);
    } else {
      toast.error(`❌ ${resultAction.payload || "Email verification failed"}`);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Please enter your email first");
      return;
    }

    setIsResending(true);
    const resultAction = await dispatch(resendVerificationCode(email));
    setIsResending(false);

    if (resendVerificationCode.fulfilled.match(resultAction)) {
      toast.success("✅ Verification code sent");
    } else {
      toast.error(`❌ ${resultAction.payload || "Failed to resend code"}`);
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
                    Verify email
                  </h2>
                  <p className="text-xs text-white/80">
                    Enter the 6-digit code sent to{" "}
                    <span className="font-semibold">{email || "your email"}</span>.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-white/80">Step</div>
                <div className="text-sm font-semibold">2 / 3</div>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold ring-1 bg-white/10 text-white ring-white/20">
                  1
                </div>
                <div className="flex-1 h-2 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-white/90" style={{ width: "66%" }} />
                </div>
                <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold ring-1 bg-white text-[color:var(--brand-700)] ring-white/30">
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
              initialValues={{ email, code: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {() => (
                <Form className="space-y-3">
                  <ApTextInput
                    label="Verification code"
                    name="code"
                    placeHolder="Enter 6-digit code"
                    maxlength={6}
                  />

                  <ApButton
                    type="submit"
                    className="w-full bg-[color:var(--brand-600)] hover:bg-[color:var(--brand-700)] text-white"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    title={isSubmitting ? "Verifying..." : "Verify"}
                  />

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      className="text-xs font-semibold brand-text hover:underline disabled:opacity-60"
                      onClick={handleResend}
                      disabled={isSubmitting || isResending}
                    >
                      {isResending ? "Resending..." : "Resend code"}
                    </button>

                    <Link
                      href={
                        tenantSlug
                          ? `/auth/forgotPassword?tenant=${encodeURIComponent(tenantSlug)}`
                          : "/auth/forgotPassword"
                      }
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                    >
                      Change email
                    </Link>
                  </div>
                </Form>
              )}
            </Formik>

            <div className="mt-6 text-center text-sm text-slate-700">
              Need an account?{" "}
              <Link
                href={
                  tenantSlug
                    ? `/auth/signup?tenant=${encodeURIComponent(tenantSlug)}`
                    : "/auth/signup"
                }
                className="brand-text font-semibold hover:underline"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
