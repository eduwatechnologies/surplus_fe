"use client";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { ApTextInput } from "@/components/input/textInput";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { signUpUser } from "@/redux/features/user/userThunk";
import { ApButton } from "@/components/button/button";
import { useRouter } from "next/navigation";
import logo from "@/public/images/logo.png";
import Image from "next/image";
import Link from "next/link";

export default function SignUp() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  // const validationSchema = Yup.object({
  //   firstName: Yup.string().required("First name is required"),
  //   lastName: Yup.string().required("Last name is required"),
  //   email: Yup.string().email("Invalid email").required("Email is required"),
  //   state: Yup.string().required("State is required"),
  //   phone: Yup.string()
  //     .matches(/^\d{11}$/, "Phone number must be exactly 11 digits")
  //     .required("Phone number is required"),
  //   password: Yup.string()
  //     .min(6, "Password must be at least 6 characters")
  //     .required("Password is required"),
  //   confirmPassword: Yup.string()
  //     .oneOf([Yup.ref("password")], "Passwords must match")
  //     .required("Confirm Password is required"),
  //   referralCode: Yup.string()
  //     .matches(/^[a-zA-Z0-9]*$/, "Referral code must be alphanumeric")
  //     .optional(),
  //   pinCode: Yup.string()
  //     .matches(/^\d{4}$/, "PIN code must be exactly 4 digits")
  //     .nullable()
  //     .required("PIN code is required"),
  // });

  // ✅ Form Submission Handler
  const validationSchema = Yup.object({
    firstName: Yup.string()
      .matches(/^[A-Za-z]+$/, "First name must contain only letters")
      .min(2, "First name must be at least 2 characters")
      .max(30, "First name must be at most 30 characters")
      .required("First name is required"),

    lastName: Yup.string()
      .matches(/^[A-Za-z]+$/, "Last name must contain only letters")
      .min(2, "Last name must be at least 2 characters")
      .max(30, "Last name must be at most 30 characters")
      .required("Last name is required"),

    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),

    state: Yup.string()
      .matches(/^[A-Za-z\s]+$/, "State must contain only letters")
      .required("State is required"),

    phone: Yup.string()
      .matches(/^(?:\+234|0)[789][01]\d{8}$/, "Invalid Nigerian phone number")
      .required("Phone number is required"),

    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),

    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm Password is required"),

    referralCode: Yup.string()
      .matches(/^[a-zA-Z0-9]*$/, "Referral code must be alphanumeric")
      .optional(),

    pinCode: Yup.string()
      .matches(/^\d{4}$/, "PIN code must be exactly 4 digits")
      .required("PIN code is required"),
  });

  const handleSubmit = async (values: any) => {
    const resultAction = await dispatch(signUpUser(values));
    if (signUpUser.fulfilled.match(resultAction)) {
      toast.success("🎉 Sign-up successful! Redirecting...");
      router.push("/auth/signin");
    } else {
      toast.error(`❌ ${resultAction.payload || "Signup failed"}`);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen ">
      <div className="bg-white p-6 w-96">
        <div className="flex justify-center mb-4">
          <Image src={logo} alt="PayOnce logo" width={50} height={40} />
        </div>
        <h2 className="text-2xl font-semibold text-center mb-2">
          Create Account
        </h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Join PayOnce today and start enjoying instant VTU recharges and
          seamless bill payments.
        </p>

        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            state: "",
            phone: "",
            referralCode: "", // Optional PIN code field
            password: "",
            confirmPassword: "",
            pinCode: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form>
              <ApTextInput
                label="First Name"
                name="firstName"
                placeHolder="Enter your first name"
              />
              <ApTextInput
                label="Last Name"
                name="lastName"
                placeHolder="Enter your last name"
              />
              <ApTextInput
                label="Email"
                name="email"
                placeHolder="Enter your email"
              />
              <ApTextInput
                label="State"
                name="state"
                placeHolder="Enter your state"
              />
              <ApTextInput
                label="Phone"
                name="phone"
                placeHolder="Enter your phone number"
              />
              <ApTextInput
                label="Password"
                name="password"
                type="password"
                placeHolder="Enter your password"
              />
              <ApTextInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeHolder="Confirm your password"
              />

              <ApTextInput
                label="PIN Code (optional)"
                name="pinCode"
                placeHolder="Enter a 4-digit PIN code (optional)"
              />

              <ApTextInput
                label="Referral Code (optional)"
                name="referralCode"
                placeHolder="Enter referral code (if any)"
              />

              <ApButton
                type="submit"
                className="w-full mt-4"
                disabled={loading}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </ApButton>
            </Form>
          )}
        </Formik>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <a href="/auth/signin" className="text-green-500 hover:underline">
            Sign In
          </a>
        </p>

        <p className="text-center mt-6 text-sm text-green-600">
          Want to explore more?{" "}
          <Link
            href="/"
            className="inline-block font-medium text-green-600 hover:text-blue-800 transition-colors duration-200 underline-offset-4 hover:underline"
          >
            Go back home
          </Link>
        </p>
      </div>
    </div>
  );
}
