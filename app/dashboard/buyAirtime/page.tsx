"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { ApTextInput } from "@/components/input/textInput";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { ApButton } from "@/components/button/button";
import ApHeader from "@/components/Apheader";
import {
  getDataServices,
  purchaseAirtime,
} from "@/redux/features/easyAccess/service";

interface FormValues {
  phone: string;
  amount: string;
}

const validationSchema = Yup.object({
  phone: Yup.string()
    .matches(/^[0-9]{11}$/, "Phone number must be 11 digits")
    .required("Phone number is required"),
  amount: Yup.number()
    .min(100, "Minimum amount is ₦100")
    .max(50000, "Maximum amount is ₦50,000")
    .required("Amount is required"),
});

export default function BuyAirtime() {
  const [loading, setLoading] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [pinCode, setPinCode] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const amountPresets = [100, 200, 500, 1000, 2000, 5000] as const;

  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  // Fetch available airtime networks
  const dataServices = useSelector(
    (state: RootState) => state.easyAccessdataPlans.dataServices
  );

  useEffect(() => {
    dispatch(getDataServices("airtime"));
  }, [dispatch]);

  const handleFormSubmit = async (values: FormValues) => {
    if (!pinCode || pinCode.length !== 4) {
      toast.error("Please enter a valid 4-digit PIN");
      return;
    }

    if (!selectedNetwork) {
      toast.error("Please select a network");
      return;
    }

    const payload = {
      ...values,
      networkId: selectedNetwork,
      userId: user?._id,
      amount: Number(values.amount),
      pinCode,
      airtimeType: "VTU",
    };

    setLoading(true);
    try {
      const resultAction = await dispatch(purchaseAirtime(payload));

      if (purchaseAirtime.fulfilled.match(resultAction)) {
        const { transactionId } = resultAction.payload;
        toast.success("✅ Airtime purchase successful!");
        router.push(`/dashboard/transaction?request_id=${transactionId}`);
      } else {
        toast.error(resultAction.payload?.error || "Purchase failed...!");
        const transactionId = resultAction.payload?.transactionId;
        if (transactionId) {
          router.push(`/dashboard/transaction?request_id=${transactionId}`);
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
      setPinModalOpen(false);
      setPreviewModalOpen(false);
      setPinCode("");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ApHeader title="Buy Airtime" />
      <div className="flex bg-[color:var(--brand-50)]">
        <div className="bg-white p-6 w-full max-w-md rounded-2xl shadow-sm ring-1 ring-slate-100">
          <p className="text-sm text-slate-600 text-center py-2 mb-4">
            Select your network, enter your number and amount, and complete with
            your PIN.
          </p>

          <Formik
            initialValues={{ phone: "", amount: "100" }}
            validationSchema={validationSchema}
            onSubmit={() => {}}
          >
            {({ values, setFieldValue, isValid }) => {
              const discountPercentage = 2;
              const discount =
                (Number(values.amount) * discountPercentage) / 100;
              const finalAmount = Math.max(0, Number(values.amount) - discount);
              const selectedService = dataServices.find((service: any) => {
                const provider = String(service?.name || "")
                  .split(" ")[0]
                  .toLowerCase();
                return provider === selectedNetwork;
              });

              return (
                <Form>
                  {/* Network Logos */}
                  {/* <div className="flex flex-wrap justify-center gap-4 mb-4"> */}
  <div className="grid grid-cols-4 gap-4 mb-4">
                    {dataServices.map((service: any) => {
                      const provider = String(service?.name || "")
                        .split(" ")[0]
                        .toLowerCase();
                      const isSelected = selectedNetwork === provider;

                      return (
                        <button
                          key={service._id}
                          type="button"
                          className={`group flex flex-col items-center justify-center gap-2 p-3 border-2 rounded-xl transition ${
                            isSelected
                              ? "border-[color:var(--brand-700)] bg-[color:var(--brand-50)]"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                          onClick={() => setSelectedNetwork(provider)}
                        >
                          <div className="relative flex items-center justify-center">
                            <img
                              src={service.image}
                              alt={service.name}
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
                            {provider.toUpperCase()}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <ApTextInput
                    label="Phone Number"
                    name="phone"
                    type="text"
                    placeHolder="Enter phone number"
                    onChange={(value: string) => setFieldValue("phone", value)}
                  />

                  <ApTextInput
                    label="Amount (₦)"
                    name="amount"
                    placeHolder="Enter amount between ₦100 - ₦50,000"
                  />

                  <div className="mt-2 flex flex-wrap gap-2">
                    {amountPresets.map((amt) => {
                      const active = String(values.amount || "") === String(amt);
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setFieldValue("amount", String(amt))}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${
                            active
                              ? "bg-[color:var(--brand-600)] text-white ring-[color:var(--brand-600)]"
                              : "bg-white text-slate-700 ring-slate-200 hover:bg-[color:var(--brand-50)]"
                          }`}
                        >
                          ₦{amt}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-1 text-md font-semibold">
                    Final Amount: ₦{finalAmount}
                  </div>

                  <ApButton
                    type="button"
                    className="w-full mt-4"
                    disabled={loading || !isValid || !selectedNetwork}
                    onClick={() => {
                      if (!selectedNetwork) {
                        toast.error("Please select a network");
                        return;
                      }
                      setFormData({ phone: values.phone, amount: values.amount });
                      setPreviewModalOpen(true);
                    }}
                    title="Continue"
                  />

                  {previewModalOpen && formData && (
                    <div
                      className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4"
                      onClick={(e) => e.target === e.currentTarget && setPreviewModalOpen(false)}
                    >
                      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-100">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-base font-semibold text-slate-900">Confirm purchase</h2>
                            <p className="mt-0.5 text-xs text-slate-500">Review details before entering your PIN.</p>
                          </div>
                          {selectedService?.image ? (
                            <img src={selectedService.image} alt={selectedService.name} className="h-10 w-10 rounded-xl bg-slate-50 p-2 ring-1 ring-slate-100" />
                          ) : null}
                        </div>

                        <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-xs text-slate-500">Network</div>
                            <div className="text-sm font-semibold text-slate-900">{selectedNetwork.toUpperCase()}</div>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="text-xs text-slate-500">Phone</div>
                            <div className="text-sm font-semibold text-slate-900">{formData.phone || "—"}</div>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="text-xs text-slate-500">Amount</div>
                            <div className="text-sm font-semibold text-slate-900">₦{Number(formData.amount || 0).toLocaleString()}</div>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="text-xs text-slate-500">Discount</div>
                            <div className="text-sm font-semibold text-slate-900">₦{Number(discount || 0).toLocaleString()}</div>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="text-xs text-slate-500">Final</div>
                            <div className="text-sm font-extrabold text-[color:var(--brand-700)]">₦{Number(finalAmount || 0).toLocaleString()}</div>
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
                  )}
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
    </div>
  );
}
