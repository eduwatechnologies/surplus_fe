"use client";

import { useEffect, useState } from "react";
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
  Electricity,
  getElectricityServices,
  handleVerifyMeter,
  purchaseElectricity,
} from "@/redux/features/easyAccess/service";

interface CustomerDetails {
  name?: string;
  address?: string;
}

// Validation Schema
const validationSchema = Yup.object({
  meterno: Yup.string().required("Enter your meter number"),
  company: Yup.string().required("Provider is required"),
  metertype: Yup.string()
    .oneOf(["prepaid", "postpaid"], "Invalid type")
    .required("Select meter type"),
  amount: Yup.number()
    .min(50, "Minimum amount is ₦50")
    .required("Amount is required"),
  phone: Yup.string().required("Phone Number is required"),
});

export default function BuyElectricity() {
  const [loading, setLoading] = useState(false);
  const [isMeterVerified, setIsMeterVerified] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({});
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<any | null>(null);
  const [formData, setFormData] = useState<any | null>(null);
  const [pinCode, setPinCode] = useState("");

  const electricityServices = useSelector(
    (state: RootState) => state.easyAccessdataPlans.electricityServices
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(getElectricityServices());
  }, []);

  const formatProviderName = (provider: string) => {
    return (
      provider
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "") // remove spaces & special chars
        .replace(/electricity|phcn/g, "") + // remove unwanted words
      "electric"
    );
  };

  // Verify Meter
  const verifyMeter = async (
    values: any,
    setFieldValue: (field: string, value: any) => void
  ) => {
    setLoading(true);
    try {
      const payload = {
        company: formatProviderName(values.company || selectedProvider),
        metertype: values.metertype,
        meterno: values.meterno,
        phone: values.phone,
        amount: values.amount,
      };

      const resultAction = await dispatch(handleVerifyMeter(payload));

      if (handleVerifyMeter.fulfilled.match(resultAction)) {
        const res = resultAction.payload;

        if (res.success === "true" && res.message?.content) {
          const { Customer_Name, Address } = res.message.content;
          setCustomerDetails({ name: Customer_Name, address: Address });
          toast.success("✅ Meter number verified successfully!");
          setIsMeterVerified(true);
        } else {
          // ❌ Provider returned failure
          const providerMessage =
            typeof res.message === "string"
              ? res.message
              : JSON.stringify(res.message);
          toast.error(`❌ ${providerMessage}`);
          setCustomerDetails({});
          setIsMeterVerified(false);
          setFieldValue("amount", "");
          setFieldValue("metertype", "");
        }
      } else {
        const errPayload = resultAction.payload as any;
        const errorMessage =
          errPayload?.message || "Verification failed from provider";
        toast.error(`❌ ${errorMessage}`);
        setCustomerDetails({});
        setIsMeterVerified(false);
        setFieldValue("amount", "");
        setFieldValue("metertype", "");
      }
    } catch (error: any) {
      console.error("verifyMeter error:", error);
      toast.error(
        `❌ ${
          typeof error === "string"
            ? error
            : error.message || "Invalid meter number!"
        }`
      );
      setCustomerDetails({});
      setIsMeterVerified(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submit
  const handleFormSubmit = async (values: Electricity) => {
    if (!isMeterVerified) {
      toast.error("❌ Please verify your meter number first!");
      return;
    }

    if (!pinCode || pinCode.length !== 4) {
      toast.error("Please enter a valid 4-digit PIN");
      return;
    }

    const payload = {
      meter_no: values.meterno,
      type: values.metertype,
      company: formatProviderName(selectedProvider),
      amount: Number(values.amount),
      phone: values.phone,
      userId: user?._id,
      planId: selectedPlanId || "..",
      pinCode,
    };

    setLoading(true);
    try {
      const resultAction = await dispatch(purchaseElectricity(payload as any));

      if (purchaseElectricity.fulfilled.match(resultAction)) {
        setPurchaseResult({
          success: true,
          message:
            resultAction.payload?.message || "✅ Electricity purchase successful!",
          transactionId: resultAction.payload?.transactionId,
          transaction: resultAction.payload?.transaction || null,
        });
        setResultModalOpen(true);
      } else {
        setPurchaseResult({
          success: false,
          message:
            resultAction.payload?.message || "❌ Electricity purchase failed",
          error: resultAction.payload?.error,
          transactionId: resultAction.payload?.transactionId,
          transaction: resultAction.payload?.transaction || null,
        });
        setResultModalOpen(true);
      }
    } catch (error) {
      console.error("handleFormSubmit error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
      setPinModalOpen(false);
      setPreviewModalOpen(false);
      setPinCode("");
    }
  };

  // Handle meter type change
  const handleTypeChange = (
    metertype: string,
    values: Electricity,
    setFieldValue: (field: string, value: string) => void
  ) => {
    setFieldValue("metertype", metertype);
    if (values.meterno && selectedProvider) {
      verifyMeter(
        {
          meterno: values.meterno,
          company: selectedProvider,
          metertype,
          amount: values.amount,
          phone: values.phone,
        },
        setFieldValue
      );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ApHeader title="Buy Electricity" />
      <div className="flex bg-[color:var(--brand-50)] justify-center p-4">
        <div className="bg-white p-6 w-full max-w-md rounded-2xl shadow-sm ring-1 ring-slate-100">
          <p className="text-sm text-slate-600 text-center py-2 mb-4">
            Select provider, verify your meter, enter amount and phone, and
            complete with your PIN.
          </p>
          <Formik
            initialValues={{
              meterno: "",
              company: "",
              metertype: "",
              amount: "",
              phone: "",
            }}
            validationSchema={validationSchema}
            onSubmit={() => {}}
          >
            {({ values, setFieldValue, isValid }) => (
              <Form>
                <div className="mb-4">
                  <div className="text-sm font-medium text-slate-700 mb-2 text-center">
                    Select Provider
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {electricityServices.map((provider: any) => {
                      const label = String(provider?.name || "")
                        .split(" ")[0]
                        .toLowerCase();
                      const isSelected = selectedProvider === provider?.name;

                      return (
                        <button
                          key={provider?._id || provider?.id || provider?.name}
                          type="button"
                          className={`group flex flex-col items-center justify-center gap-2 p-3 border-2 rounded-xl transition ${
                            isSelected
                              ? "border-[color:var(--brand-700)] bg-[color:var(--brand-50)]"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                          onClick={() => {
                            setSelectedProvider(provider?.name);
                            setSelectedPlanId(provider?._id);
                            setFieldValue("company", provider?.name);
                            setIsMeterVerified(false);
                            setCustomerDetails({});
                          }}
                        >
                          <div className="relative flex items-center justify-center">
                            <img
                              src={provider?.image}
                              alt={provider?.name}
                              className="w-10 h-10 object-contain"
                            />
                            {isSelected ? (
                              <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--brand-700)] text-[10px] font-bold text-white">
                                ✓
                              </span>
                            ) : null}
                          </div>
                          <span
                            className={`text-[11px] font-semibold ${
                              isSelected
                                ? "text-[color:var(--brand-700)]"
                                : "text-slate-600 group-hover:text-slate-800"
                            }`}
                          >
                            {label ? label.toUpperCase() : "—"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Meter Number */}
                <ApTextInput
                  label="Meter Number"
                  name="meterno"
                  type="text"
                  placeHolder="Enter your meter number"
                />

                {/* Customer Details */}
                {isMeterVerified && (
                  <div className="mt-3 p-4 rounded-2xl bg-slate-50 ring-1 ring-slate-100">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-500">Name</div>
                      <div className="text-sm font-semibold text-slate-900">
                        {customerDetails.name || "N/A"}
                      </div>
                    </div>
                    {customerDetails.address ? (
                      <div className="mt-2 flex items-start justify-between gap-3">
                        <div className="text-xs text-slate-500">Address</div>
                        <div className="text-sm font-semibold text-slate-900 text-right">
                          {customerDetails.address}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Amount */}
                <ApTextInput
                  label="Amount (₦)"
                  name="amount"
                  placeHolder="Enter Amount"
                />

                {/* Phone */}
                <ApTextInput
                  label="Phone Number"
                  name="phone"
                  placeHolder="Enter phone number"
                />

                {/* Meter Type */}
                <label className="block text-sm font-medium text-slate-700 mt-2">
                  Select Meter Type
                </label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {["prepaid", "postpaid"].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
                    >
                      <input
                        type="radio"
                        name="metertype"
                        value={type}
                        checked={values.metertype === type}
                        onChange={() =>
                          handleTypeChange(type, values, setFieldValue)
                        }
                        className="h-4 w-4 accent-[color:var(--brand-700)]"
                      />
                      <span className="text-sm font-semibold text-slate-700">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Continue Button */}
                <ApButton
                  type="button"
                  className="w-full mt-4"
                  disabled={loading || !isValid || !selectedProvider}
                  onClick={() => {
                    if (!selectedProvider) {
                      toast.error("Please select a provider");
                      return;
                    }
                    if (!isMeterVerified) {
                      toast.error("❌ Please verify your meter number first!");
                      return;
                    }
                    setFormData(values);
                    setPreviewModalOpen(true);
                  }}
                  title="Continue"
                />
              </Form>
            )}
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
                <div className="text-xs text-slate-500">Provider</div>
                <div className="text-sm font-semibold text-slate-900">
                  {String(selectedProvider || "—")}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">Meter</div>
                <div className="text-sm font-semibold text-slate-900">
                  {String(formData.meterno || "—")}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">Type</div>
                <div className="text-sm font-semibold text-slate-900">
                  {String(formData.metertype || "—").toUpperCase()}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">Phone</div>
                <div className="text-sm font-semibold text-slate-900">
                  {String(formData.phone || "—")}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">Amount</div>
                <div className="text-sm font-extrabold text-[color:var(--brand-700)]">
                  ₦{Number(formData.amount || 0).toLocaleString()}
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
                      (formData?.amount ? Number(formData.amount) : 0)
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
