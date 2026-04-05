"use client";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { ApTextInput } from "@/components/input/textInput";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/redux/features/user/userThunk";
import { AppDispatch, RootState } from "@/redux/store";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { ApButton } from "@/components/button/button";
import Link from "next/link";
import logo from "@/public/images/logo.png";
import Image from "next/image";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get("tenant") || "";
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = async (values: any) => {
    const resultAction = await dispatch(loginUser(values));
    if (loginUser.fulfilled.match(resultAction)) {
      toast.success("Login successful");
      router.push("/dashboard");
    } else {
      toast.error(` ${resultAction.payload || "Login failed"}`);
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
                    Sign in
                  </h2>
                  <p className="text-xs text-white/80">
                    Continue where you left off.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              <Form className="space-y-3">
                <ApTextInput
                  label="Email"
                  name="email"
                  placeHolder="Enter your email"
                />
                <ApTextInput
                  label="Password"
                  name="password"
                  type="password"
                  placeHolder="Enter your password"
                />

                {error ? (
                  <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">
                    {String(error)}
                  </div>
                ) : null}

                <div className="flex items-center justify-between pt-1">
                  <Link
                    href={
                      tenantSlug
                        ? `/auth/forgotPassword?tenant=${encodeURIComponent(tenantSlug)}`
                        : "/auth/forgotPassword"
                    }
                    className="text-xs font-semibold brand-text hover:underline"
                  >
                    Forgot password?
                  </Link>
                  <div className="text-[11px] text-slate-500">Secure login</div>
                </div>

                <ApButton
                  type="submit"
                  className="w-full bg-[color:var(--brand-600)] hover:bg-[color:var(--brand-700)] text-white"
                  disabled={loading}
                  loading={loading}
                  title={loading ? "Processing..." : "Sign In"}
                />
              </Form>
            </Formik>

            <div className="mt-6 text-center text-sm text-slate-700">
              Don&apos;t have an account?{" "}
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
