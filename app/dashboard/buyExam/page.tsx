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
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<any | null>(null);
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
    try {
      const resultAction = await dispatch(purchaseExam({ payload }));

      if (purchaseExam.fulfilled.match(resultAction)) {
        setPurchaseResult({
          success: true,
          message:
            resultAction.payload?.message || "✅ Exam purchase successful!",
          transactionId: resultAction.payload?.transactionId,
          transaction: resultAction.payload?.transaction || null,
        });
        setResultModalOpen(true);
      } else {
        setPurchaseResult({
          success: false,
          message: resultAction.payload?.message || "❌ Exam purchase failed",
          error: resultAction.payload?.error,
          transactionId: resultAction.payload?.transactionId,
          transaction: resultAction.payload?.transaction || null,
        });
        setResultModalOpen(true);
      }
    } finally {
      setLoading(false);
      setPinModalOpen(false);
      setPreviewModalOpen(false);
      setPinCode("");
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--brand-50)]">
      <ApHeader title="Buy Exam Card" />
      <div className="flex  justify-center py-4">
        <div className="w-full max-w-md rounded-2xl shadow-sm ring-1 ring-slate-100">
       

          <Formik
            initialValues={{
              quantity: "",
              phone: "",
              type: "",
            }}
            validationSchema={validationSchema}
            onSubmit={() => {}}
          >
            {({ values, setFieldValue, isValid }) => {
              const computedAmount = values.quantity
                ? Number(values.quantity) * unitPrice
                : 0;

              return (
                <Form>
                  {/* Exam Selection */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {examServices.map((exam, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`group flex flex-col items-center justify-center gap-2 p-3 border-2 rounded-xl transition ${
                          selectedExam === exam.code
                            ? "border-[color:var(--brand-700)] bg-[color:var(--brand-50)]"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                        onClick={() => {
                          setSelectedExam(exam.code);
                          setSelectedPlanId(exam?._id);
                          setFieldValue("type", exam.code);
                          handleCategorySelect(
                            exam.name.replace(" PIN", "").toLowerCase()
                          );
                        }}
                      >
                        <div className="relative flex items-center justify-center">
                          <img
                            src={exam.image}
                            alt={exam.name}
                            className="w-10 h-10 object-contain"
                          />
                          {selectedExam === exam.code ? (
                            <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--brand-700)] text-[10px] font-bold text-white">
                              ✓
                            </span>
                          ) : null}
                        </div>
                        <span
                          className={`text-[11px] font-semibold ${
                            selectedExam === exam.code
                              ? "text-[color:var(--brand-700)]"
                              : "text-slate-600 group-hover:text-slate-800"
                          }`}
                        >
                          {String(exam.code || "")
                            .replace(/[^a-z0-9]/gi, "")
                            .toUpperCase() || "—"}
                        </span>
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
                      <label className="block text-sm font-medium text-slate-700">
                        Unit Price
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`₦${unitPrice}`}
                        className="mt-1 p-2 border border-slate-200 rounded-xl w-full bg-slate-50"
                      />
                    </div>
                  )}

                  {/* Computed total amount */}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-slate-700">
                      Total Amount
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={computedAmount > 0 ? `₦${computedAmount}` : ""}
                      className="mt-1 p-2 border border-slate-200 rounded-xl w-full bg-slate-50"
                    />
                  </div>

                  <ApButton
                    type="button"
                    className="w-full mt-4"
                    disabled={loading || !selectedExam || !isValid}
                    title="Continue"
                    onClick={() => {
                      if (!selectedExam) {
                        toast.error("Please select an exam type");
                        return;
                      }
                      if (!isValid) {
                        toast.error("Please fill the form correctly");
                        return;
                      }
                      setFormData(values);
                      setPreviewModalOpen(true);
                    }}
                  />
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>

      {previewModalOpen && formData ? (
        <div
          className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setPreviewModalOpen(false)
          }
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Confirm purchase
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Review details before entering your PIN.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">Type</div>
                <div className="text-sm font-semibold text-slate-900">
                  {String(selectedExam || "—").toUpperCase()}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">Quantity</div>
                <div className="text-sm font-semibold text-slate-900">
                  {String(formData.quantity || "—")}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">Phone</div>
                <div className="text-sm font-semibold text-slate-900">
                  {String(formData.phone || "—")}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">Unit</div>
                <div className="text-sm font-semibold text-slate-900">
                  ₦{Number(unitPrice || 0).toLocaleString()}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">Total</div>
                <div className="text-sm font-extrabold text-[color:var(--brand-700)]">
                  ₦
                  {Number(
                    (Number(formData.quantity || 0) || 0) * (unitPrice || 0)
                  ).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <ApButton
                title="Edit"
                className="w-1/2"
                onClick={() => setPreviewModalOpen(false)}
                type="button"
              />
              <ApButton
                title="Proceed"
                className="w-1/2 bg-[color:var(--brand-600)] hover:bg-[color:var(--brand-700)]"
                onClick={() => {
                  setPreviewModalOpen(false);
                  setPinModalOpen(true);
                }}
                type="button"
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* PIN Modal */}
      {pinModalOpen && (
        <div
          className="fixed inset-0 bg-black/20 bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setPinModalOpen(false)
          }
        >
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-lg ring-1 ring-slate-100">
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
              className="w-full p-2 border-2 border-slate-200 rounded-xl mb-4 text-center text-xl tracking-widest focus:border-[color:var(--brand-600)] focus:outline-none"
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
                className="w-1/2 bg-[color:var(--brand-600)] hover:bg-[color:var(--brand-700)]"
                disabled={loading || pinCode.length !== 4}
                onClick={() => formData && handleFormSubmit(formData)}
                type="button"
              />
            </div>
          </div>
        </div>
      )}

      {resultModalOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setResultModalOpen(false)
          }
        >
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-lg ring-1 ring-slate-100">
            <div className="text-center">
              <div
                className={`mx-auto inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  purchaseResult?.success
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                    : "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                }`}
              >
                {purchaseResult?.success ? "SUCCESS" : "FAILED"}
              </div>
              <h2 className="mt-3 text-base font-semibold text-slate-900">
                {purchaseResult?.message || "Transaction update"}
              </h2>
              {purchaseResult?.error ? (
                <p className="mt-1 text-xs text-slate-500">
                  {purchaseResult.error}
                </p>
              ) : null}
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">Transaction ID</div>
                <div className="text-xs font-semibold text-slate-900 break-all text-right">
                  {purchaseResult?.transactionId || "—"}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">Amount</div>
                <div className="text-sm font-semibold text-slate-900">
                  ₦
                  {Number(
                    purchaseResult?.transaction?.amount ??
                      (formData?.quantity ? Number(formData.quantity) * unitPrice : 0)
                  ).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">Date</div>
                <div className="text-xs font-semibold text-slate-900 text-right">
                  {purchaseResult?.transaction?.createdAt
                    ? new Date(purchaseResult.transaction.createdAt).toLocaleString()
                    : new Date().toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <ApButton
                title="Close"
                className="w-1/2"
                onClick={() => setResultModalOpen(false)}
                type="button"
              />
              <ApButton
                title="View details"
                className="w-1/2 bg-[color:var(--brand-600)] hover:bg-[color:var(--brand-700)]"
                disabled={!purchaseResult?.transactionId}
                onClick={() => {
                  if (!purchaseResult?.transactionId) return;
                  setResultModalOpen(false);
                  router.push(
                    `/dashboard/transaction?request_id=${purchaseResult.transactionId}`
                  );
                }}
                type="button"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
