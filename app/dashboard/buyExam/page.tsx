"use client";

import { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { ApTextInput } from "@/components/input/textInput";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { ApButton } from "@/components/button/button";
import ApHeader from "@/components/Apheader";
import {
  fetchDataPlans,
  getExamServices,
  purchaseExam,
} from "@/redux/features/easyAccess/service";

export default function BuyExam() {
  const [loading, setLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [selectedPlanId, setSelectedPlanId] = useState<string>();
  const [pinCode, setPinCode] = useState("");
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [formData, setFormData] = useState<any | null>(null);

  // amount & unit price start at 0 so we don't get NaN
  const [unitPrice, setUnitPrice] = useState<number>(0);

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const examServices = useSelector(
    (state: RootState) => state.easyAccessdataPlans.examServices
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(getExamServices());
  }, [dispatch]);

  const validationSchema = Yup.object({
    quantity: Yup.number()
      .oneOf([1, 2, 3, 4, 5, 10], "Allowed values: 1,2,3,4,5,10")
      .required("Enter quantity"),
    phone: Yup.string()
      .matches(/^[0-9]{11}$/, "Phone number must be 11 digits")
      .required("Phone number is required"),
  });

  const handleCategorySelect = async (category: string) => {
    try {
      const result = await dispatch(
        fetchDataPlans({ category: category, network: category })
      );
      if (fetchDataPlans.fulfilled.match(result)) {
        const fetchedPrice = result.payload.plans[0]?.ourPrice || 0;
        setUnitPrice(fetchedPrice);
        console.log(unitPrice);
      } else {
        toast.error(result.payload || "Failed to fetch plans");
      }
    } catch {
      toast.error("Unexpected error while fetching plans");
    }
  };

  const handleFormSubmit = async (values: any) => {
    if (!pinCode || pinCode.length !== 4) {
      toast.error("Please enter a valid 4-digit PIN");
      return;
    }

    const totalAmount = values.quantity * unitPrice;

    const payload = {
      type: selectedExam.toLowerCase(),
      amount: totalAmount,
      phone: values.phone.trim(),
      userId: user?._id,
      planId: selectedPlanId,
      noOfPin: Number(values.quantity),
      pinCode,
    };

    setLoading(true);
    const resultAction = await dispatch(purchaseExam({ payload }));
    setLoading(false);

    if (purchaseExam.fulfilled.match(resultAction)) {
      const { request_id } = resultAction.payload;
      toast.success("✅ Exam purchase successful!");
      router.push(`/dashboard/transaction?request_id=${request_id}`);
    } else {
      toast.error(`❌ ${resultAction.payload || "Exam purchase failed!"}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ApHeader title="Buy Exam Card" />
      <div className="flex justify-center">
        <div className="bg-white p-6 w-96">
          <p className="text-sm text-gray-600 text-center py-2 mb-4">
            Select your exam type, enter your number, and get pins instantly.
          </p>

          <Formik
            initialValues={{
              quantity: "",
              phone: "",
              type: "",
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              setFormData(values);
              setPinModalOpen(true);
            }}
          >
            {({ values, setFieldValue }) => {
              const computedAmount = values.quantity
                ? Number(values.quantity) * unitPrice
                : 0;

              return (
                <Form>
                  {/* Exam Selection */}
                  <div className="flex justify-center space-x-4 mb-4">
                    {examServices.map((exam, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`p-2 rounded-lg border ${
                          selectedExam === exam.name
                            ? "border-blue-500"
                            : "border-gray-300"
                        } hover:border-blue-500 transition`}
                        onClick={() => {
                          setSelectedExam(exam.code);
                          setSelectedPlanId(exam?._id);
                          setFieldValue("type", exam.code);
                          handleCategorySelect(
                            exam.name.replace(" PIN", "").toLowerCase()
                          );
                        }}
                      >
                        <img
                          src={exam.image}
                          alt={exam.name}
                          className="w-12 h-12"
                        />
                      </button>
                    ))}
                  </div>

                  <ApTextInput
                    label="Exam Type"
                    name="type"
                    type="text"
                    placeHolder="Enter Exam Type"
                    readOnly
                  />

                  <ApTextInput
                    label="Quantity"
                    name="quantity"
                    type="number"
                    placeHolder="Number of pins (1,2,3,4,5,10)"
                  />

                  <ApTextInput
                    label="Phone Number"
                    name="phone"
                    type="text"
                    placeHolder="Enter phone number"
                  />

                  {/* Show unit price */}
                  {unitPrice > 0 && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Unit Price
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`₦${unitPrice}`}
                        className="mt-1 p-2 border border-gray-300 rounded-md w-full bg-gray-100"
                      />
                    </div>
                  )}

                  {/* Computed total amount */}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Total Amount
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={computedAmount > 0 ? `₦${computedAmount}` : ""}
                      className="mt-1 p-2 border border-gray-300 rounded-md w-full bg-gray-100"
                    />
                  </div>

                  <ApButton
                    type="submit"
                    className="w-full mt-4"
                    disabled={loading || !selectedExam}
                    title={loading ? "Processing..." : "Buy Exam"}
                  />
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>

      {/* PIN Modal */}
      {pinModalOpen && (
        <div
          className="fixed inset-0 bg-black/20 bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setPinModalOpen(false)
          }
        >
          <div className="bg-white p-6 rounded-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4 text-center">
              Enter Transaction PIN
            </h2>
            <input
              type="password"
              value={pinCode}
              onChange={(e) => {
                if (/^\d{0,4}$/.test(e.target.value)) {
                  setPinCode(e.target.value);
                }
              }}
              maxLength={4}
              className="w-full p-2 border-2 border-gray-300 rounded-lg mb-4 text-center text-xl tracking-widest focus:border-blue-500 focus:outline-none"
              placeholder="••••"
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
            />
            <div className="flex gap-3 justify-between">
              <ApButton
                title="Cancel"
                className="w-1/2"
                onClick={() => {
                  setPinModalOpen(false);
                  setPinCode("");
                }}
                disabled={loading}
              />
              <ApButton
                title={loading ? "Processing..." : "Submit"}
                className="w-1/2 bg-blue-600 hover:bg-blue-700"
                disabled={loading || pinCode.length !== 4}
                onClick={() => formData && handleFormSubmit(formData)}
                type="button"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
