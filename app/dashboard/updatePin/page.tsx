"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { ApButton } from "@/components/button/button";
import ApHeader from "@/components/Apheader";
import { updatePin } from "@/redux/features/user/userThunk";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { ApTextInput } from "@/components/input/textInput";

const validationSchema = Yup.object().shape({
  oldpin: Yup.string()
    .required("Old PIN is required")
    .matches(/^\d{4}$/, "PIN must be exactly 4 digits"),
  newpin: Yup.string()
    .required("New PIN is required")
    .matches(/^\d{4}$/, "PIN must be exactly 4 digits"),
});

export default function UpdatePinForm() {
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (
    values: { oldpin: string; newpin: string },
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const resultAction = await dispatch(updatePin(values));
      if (updatePin.fulfilled.match(resultAction)) {
        toast.success("PIN updated successfully");
        resetForm();
      } else {
        toast.error(resultAction.payload as string);
      }
    } catch (err) {
      console.error("Error updating PIN:", err);
      toast.error("Unexpected error. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg p-6 rounded">
      <ApHeader title="Update Transaction PIN" />
      <Formik
        initialValues={{ oldpin: "", newpin: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-4 text-center">
                Please enter your old PIN and the new PIN you want to set. The
                new PIN must be exactly 4 digits.
              </p>
              <ApTextInput
                label="Old PIN"
                name="oldpin"
                type="password"
                placeHolder="Enter old PIN"
              />
              <ApTextInput
                label="New PIN"
                name="newpin"
                type="password"
                placeHolder="Enter new PIN"
              />
              <ApButton
                type="submit"
                title={isSubmitting ? "Updating..." : "Update PIN"}
                disabled={isSubmitting}
                className="w-full"
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
