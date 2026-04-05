"use client";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { ApTextInput } from "@/components/input/textInput";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { signUpUser } from "@/redux/features/user/userThunk";
import { ApButton } from "@/components/button/button";
import { useRouter, useSearchParams } from "next/navigation";
import logo from "@/public/images/logo.png";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function SignUpForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get("tenant") || "";
  const [step, setStep] = useState<0 | 1>(0);

  const validationSchema = useMemo(() => {
    const step1Schema = Yup.object({
      fullName: Yup.string()
        .transform((v) => String(v || "").trim().replace(/\s+/g, " "))
        .matches(
          /^[A-Za-z]+(?:[ '-][A-Za-z]+)+$/,
          "Enter your first and last name"
        )
        .min(4, "Full name must be at least 4 characters")
        .max(60, "Full name must be at most 60 characters")
        .required("Full name is required"),

      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),

      phone: Yup.string()
        .matches(/^(?:\+234|0)[789][01]\d{8}$/, "Invalid Nigerian phone number")
        .required("Phone number is required"),

      state: Yup.string()
        .matches(/^[A-Za-z\s]+$/, "State must contain only letters")
        .required("State is required"),
    });

    const step2Schema = Yup.object({
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),

      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Confirm Password is required"),

      pinCode: Yup.string()
        .matches(/^\d{4}$/, "PIN code must be exactly 4 digits")
        .required("PIN code is required"),

      referralCode: Yup.string()
        .matches(/^[a-zA-Z0-9]*$/, "Referral code must be alphanumeric")
        .optional(),
    });

    return step === 0 ? step1Schema : step2Schema;
  }, [step]);

  const splitFullName = (raw: string) => {
    const cleaned = String(raw || "").trim().replace(/\s+/g, " ");
    const parts = cleaned.split(" ").filter(Boolean);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ");
    return { firstName, lastName };
  };

  const handleSubmit = async (values: any) => {
    const { firstName, lastName } = splitFullName(values.fullName);
    const payload = {
      firstName,
      lastName,
      email: values.email,
      state: values.state,
      phone: values.phone,
      password: values.password,
      pinCode: values.pinCode,
      referralCode: values.referralCode,
      tenantSlug: values.tenantSlug,
    };

    const resultAction = await dispatch(signUpUser(payload));
    if (signUpUser.fulfilled.match(resultAction)) {
      toast.success("🎉 Sign-up successful! Redirecting...");
      router.push(
        tenantSlug
          ? `/auth/signin?tenant=${encodeURIComponent(tenantSlug)}`
          : "/auth/signin"
      );
    } else {
      toast.error(`❌ ${resultAction.payload || "Signup failed"}`);
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
                    Create account
                  </h2>
                  <p className="text-xs text-white/80">
                    Fast onboarding with secure setup.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-white/80">Step</div>
                <div className="text-sm font-semibold">
                  {step + 1} / 2
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center gap-3">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold ring-1 ${
                    step === 0
                      ? "bg-white text-[color:var(--brand-700)] ring-white/30"
                      : "bg-white/10 text-white ring-white/20"
                  }`}
                >
                  1
                </div>
                <div className="flex-1 h-2 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-white/90"
                    style={{ width: step === 0 ? "50%" : "100%" }}
                  />
                </div>
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold ring-1 ${
                    step === 1
                      ? "bg-white text-[color:var(--brand-700)] ring-white/30"
                      : "bg-white/10 text-white ring-white/20"
                  }`}
                >
                  2
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-white/80">
                <div>Profile</div>
                <div>Security</div>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <Formik
              initialValues={{
                fullName: "",
                email: "",
                state: "",
                phone: "",
                password: "",
                confirmPassword: "",
                pinCode: "",
                referralCode: "",
                tenantSlug,
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ validateForm, setTouched }) => (
                <Form className="space-y-3">
                  {step === 0 ? (
                    <>
                      <ApTextInput
                        label="Full name"
                        name="fullName"
                        placeHolder="e.g. John Doe"
                        stripSpaces={false}
                      />
                      <ApTextInput
                        label="Email"
                        name="email"
                        placeHolder="Enter your email"
                      />
                      <ApTextInput
                        label="Phone"
                        name="phone"
                        placeHolder="e.g. 08012345678"
                      />
                      <ApTextInput
                        label="State"
                        name="state"
                        placeHolder="e.g. Lagos"
                        stripSpaces={false}
                      />
                    </>
                  ) : (
                    <>
                      <ApTextInput
                        label="Password"
                        name="password"
                        type="password"
                        placeHolder="Create a password"
                      />
                      <ApTextInput
                        label="Confirm password"
                        name="confirmPassword"
                        type="password"
                        placeHolder="Re-enter your password"
                      />
                      <ApTextInput
                        label="4-digit PIN"
                        name="pinCode"
                        placeHolder="e.g. 1234"
                        maxlength={4}
                      />
                      <ApTextInput
                        label="Referral code (optional)"
                        name="referralCode"
                        placeHolder="Enter referral code (if any)"
                      />
                    </>
                  )}

                  <div className="pt-2 flex gap-3">
                    {step === 1 ? (
                      <ApButton
                        type="button"
                        className="w-1/2 bg-slate-100 text-slate-700 hover:bg-slate-200"
                        disabled={loading}
                        onClick={() => setStep(0)}
                      >
                        Back
                      </ApButton>
                    ) : null}

                    {step === 0 ? (
                      <ApButton
                        type="button"
                        className="w-full bg-[color:var(--brand-600)] hover:bg-[color:var(--brand-700)] text-white"
                        disabled={loading}
                        onClick={async () => {
                          setTouched(
                            {
                              fullName: true,
                              email: true,
                              phone: true,
                              state: true,
                            } as any,
                            true
                          );

                          const errors = await validateForm();
                          const hasStepErrors =
                            Boolean((errors as any)?.fullName) ||
                            Boolean((errors as any)?.email) ||
                            Boolean((errors as any)?.phone) ||
                            Boolean((errors as any)?.state);

                          if (!hasStepErrors) setStep(1);
                        }}
                      >
                        Continue
                      </ApButton>
                    ) : (
                      <ApButton
                        type="submit"
                        className="w-1/2 bg-[color:var(--brand-600)] hover:bg-[color:var(--brand-700)] text-white"
                        disabled={loading}
                      >
                        {loading ? "Creating..." : "Create account"}
                      </ApButton>
                    )}
                  </div>
                </Form>
              )}
            </Formik>

            <div className="mt-6 text-center text-sm text-slate-700">
              Already have an account?{" "}
              <Link
                href={
                  tenantSlug
                    ? `/auth/signin?tenant=${encodeURIComponent(tenantSlug)}`
                    : "/auth/signin"
                }
                className="brand-text font-semibold hover:underline"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-4 text-center text-sm brand-text">
              Want to explore more?{" "}
              <Link
                href="/"
                className="inline-block font-medium brand-text hover:text-[color:var(--brand-700)] transition-colors duration-200 underline-offset-4 hover:underline"
              >
                Go back home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
