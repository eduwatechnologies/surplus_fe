"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { ApTextInput } from "@/components/input/textInput";
import { toast } from "react-toastify";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { verifyResetCode } from "@/redux/features/user/userThunk";
import { useRouter, useSearchParams } from "next/navigation";
import { ApButton } from "@/components/button/button";
import { useState } from "react";

export function VerifyEmailForm() {
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object({
    code: Yup.string()
      .matches(/^\d+$/, "Only numbers are allowed")
      .required("Verification code is required"),
  });

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    const resultAction = await dispatch(verifyResetCode(values));
    setIsSubmitting(false);

    if (verifyResetCode.fulfilled.match(resultAction)) {
      toast.success("✅ Email verified successfully");
      router.push(
        `/auth/resetpassword?email=${values.email}&code=${values.code}`
      );
    } else {
      toast.error(`❌ ${resultAction.payload || "Email verification failed"}`);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-primary bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96 text-center">
        <h2 className="text-2xl font-semibold mb-4">Verify Your Email</h2>
        <p className="text-gray-600 text-sm mb-6">
          A 6-digit verification code has been sent to your email. Please enter
          the code below.
        </p>

        <Formik
          initialValues={{ email, code: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form>
              <ApTextInput
                label="Verification Code"
                name="code"
                placeHolder="Enter 6-digit code"
              />

              <ApButton
                type="submit"
                className="w-full mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Verifying..." : "Verify"}
              </ApButton>
            </Form>
          )}
        </Formik>

        <p className="text-center mt-4 text-sm">
          Didn't receive the code?{" "}
          <button
            className="text-blue-500 hover:underline"
            onClick={() => alert("Resending verification code...")}
          >
            Resend Code
          </button>
        </p>

        <p className="text-center mt-2 text-sm">
          Wrong email?{" "}
          <a href="/auth/signup" className="text-blue-500 hover:underline">
            Sign Up Again
          </a>
        </p>
      </div>
    </div>
  );
}
