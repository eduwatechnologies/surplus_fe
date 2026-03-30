"use client";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { ApTextInput } from "@/components/input/textInput";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/redux/features/user/userThunk";
import { AppDispatch, RootState } from "@/redux/store";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { ApButton } from "@/components/button/button";
import Link from "next/link";
import logo from "@/public/images/logo.png";
import Image from "next/image";

export default function SignIn() {
  const router = useRouter();
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
    <div className="flex justify-center items-center ">
      <div className="bg-white/40 p-6 rounded-lg  w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <Image src={logo} alt="Almaleek logo" width={50} height={40} />
        </div>
        <h2 className="text-2xl font-semibold text-center mb-2">Sign In</h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Welcome back! Please enter your credentials to access your account.
        </p>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <Form>
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

            <p className="text-right mt-2 text-sm">
              <Link
                href="/auth/forgotPassword"
                className="text-green-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </p>

            <ApButton
              type="submit"
              className="w-full mt-4"
              disabled={loading}
              loading={loading}
              title={loading ? "Processing..." : "Sign In"}
            />
          </Form>
        </Formik>

        <p className="text-center mt-4 text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-green-600 hover:underline">
            Sign Up
          </Link>
        </p>

        <p className="text-center mt-6 text-sm text-green-600">
          Want to explore more?{" "}
          <Link
            href="/"
            className="inline-block font-medium text-green-600 hover:text-green-800 transition-colors duration-200 underline-offset-4 hover:underline"
          >
            Go back home
          </Link>
        </p>
      </div>
    </div>
  );
}
