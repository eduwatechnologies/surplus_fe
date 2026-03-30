"use client";
import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import ApHeader from "@/components/Apheader";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { updatePassword } from "@/redux/features/user/userThunk";
import { toast } from "react-toastify";
import { ApTextInput } from "@/components/input/textInput";
import { ApButton } from "@/components/button/button";


export default function UpdatePassword() {
  const dispatch = useDispatch<AppDispatch>();

  const initialValues = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object({
    currentPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string()
      .min(6, "New password must be at least 6 characters")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Passwords must match")
      .required("Confirm password is required"),
  });

  const handleSubmit = async (
    values: { currentPassword: string; newPassword: string },
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const resultAction = await dispatch(updatePassword(values));
      if (updatePassword.fulfilled.match(resultAction)) {
        toast.success("Password updated successfully");
        resetForm(); // Reset the form after successful submission
      } else {
        toast.error(resultAction.payload as string);
      }
    } catch (err) {
      console.error("Error updating password:", err);
      toast.error("Unexpected error. Please try again.");
    }
  };
  return (
    <div className="">
      <ApHeader
        title="
        Update Password
            "
      />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, formikHelpers) =>
          handleSubmit(values, formikHelpers)
        }
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-4 bg-white p-3">
            <ApTextInput
              label="Current Password"
              name="currentPassword"
              type="password"
              placeHolder="Enter new password"
            />
            <ApTextInput
              label="New Password"
              name="newPassword"
              type="password"
              placeHolder="Enter new password"
            />

            <ApTextInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeHolder="Confirm new password"
            />
        

              <ApButton
                type="submit"
                title={isSubmitting ? "Updating..." : "Update Password"}
                disabled={isSubmitting}
                className="w-full"
              />
          </Form>
        )}
      </Formik>
    </div>
  );
}
