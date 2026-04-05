"use client";

import { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { ApTextInput } from "@/components/input/textInput";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import GlobalModal from "@/components/modal/globalModal";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { ApButton } from "@/components/button/button";
import ApHeader from "@/components/Apheader";
import {
  fetchDataCategories,
  fetchDataPlans,
  getCableServices,
  handleVerifyTvSub,
  purchaseTvSub,
} from "@/redux/features/easyAccess/service";

interface CustomerDetails {
  name?: string;
  dueDate?: string;
}

type Step = "categories" | "plans";

export default function BuyCableTv() {
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({});
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [formData, setFormData] = useState<any | null>(null);
  const [pinCode, setPinCode] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [step, setStep] = useState<Step>("categories");
  const [selectedPlan, setSelectedPlan] = useState<any>();

  // const validationSchema = Yup.object({
  //   smartcard_number: Yup.string()
  //     .required("Enter your Smartcard Number")
  //     .length(10, "Smartcard number must be 10 digits"),
  //   provider: Yup.string().required("Select a Provider"),
  //   phone: Yup.string()
  //     .matches(/^[0-9]{11}$/, "Phone number must be 11 digits")
  //     .required("Phone number is required"),
  //   amount: Yup.number()
  //     .min(1, "Amount must be greater than 0")
  //     .required("Amount is required"),
  //   quantity: Yup.number()
  //     .min(1, "Minimum quantity is 1")
  //     .required("Quantity is required"),
  // });

  const cableServices = useSelector(
    (state: RootState) => state.easyAccessdataPlans.cableServices
  );
  const plans = useSelector(
    (state: RootState) => state.easyAccessdataPlans.plans
  );
  const { user } = useSelector((state: RootState) => state.auth);

  // Load available cable providers on mount
  useEffect(() => {
    dispatch(getCableServices());
  }, [dispatch]);

  /** When user clicks a provider logo */
  const handleNetworkSelect = async (provider: any, setFieldValue: any) => {
    setSelectedProvider(provider.name);
    setIsModalOpen(true);
    setStep("categories");

    try {
      const result = await dispatch(
        fetchDataCategories({
          serviceType: "cable",
          network: provider.name.toLowerCase(),
        })
      );
      if (fetchDataCategories.fulfilled.match(result)) {
        setCategories(result.payload || []);
      } else {
        toast.error("Could not load categories");
      }
    } catch {
      toast.error("Failed to load categories");
    }
  };

  /** Verify Smartcard */
  const handleVerify = async (smartcardNumber: string) => {
    if (!selectedProvider) return;

    try {
      const resultAction = await dispatch(
        handleVerifyTvSub({
          smartCardNo: smartcardNumber,
          cableType: selectedProvider,
        })
      );

      if (handleVerifyTvSub.fulfilled.match(resultAction)) {
        const { customerName } = resultAction.payload.data.validate;
        setCustomerDetails({
          name: customerName || "N/A",
        });
        setIsVerified(true);
        toast.success("✅ Smart Card number verified successfully!");
      } else {
        throw new Error("Verification failed");
      }
    } catch (error) {
      setCustomerDetails({});
      setIsVerified(false);
      toast.error("❌ Smartcard verification failed.");
    }
  };

  /** Final subscription */
  const handleFormSubmit = async (values: any) => {
    // if (!isVerified) {
    //   toast.error("❌ Please verify your smartcard first!");
    //   return;
    // }

    if (!pinCode || pinCode.length !== 4) {
      toast.error("Please enter a valid 4-digit PIN");
      return;
    }

    const payload = {
      customerName: customerDetails.name,
      provider: selectedProvider,
      userId: user?._id,
      planId: selectedPlan._id,
      smartCardNo: values.smartCardNo,
      phone: values.phone,
      amount: Number(values.amount),
      pinCode,
    };

    try {
      setLoading(true);
      const resultAction = await dispatch(purchaseTvSub({ payload }));

      if (purchaseTvSub.fulfilled.match(resultAction)) {
        const { request_id } = resultAction.payload;

        toast.success("✅ Cable TV subscription successful!");
        router.push(`/dashboard/transaction?request_id=${request_id}`);
      } else {
        throw new Error("Subscription failed");
      }
    } catch (error) {
      toast.error("❌ Subscription failed! Please try again.");
    } finally {
      setLoading(false);
      setPinModalOpen(false);
      setPreviewModalOpen(false);
      setPinCode("");
    }
  };

  /** Handle selecting a category */
  const handleCategorySelect = async (category: string) => {
    try {
      const result = await dispatch(
        fetchDataPlans({ network: selectedProvider, category })
      );
      if (fetchDataPlans.fulfilled.match(result)) {
        setStep("plans");
      } else {
        toast.error(result.payload || "Failed to fetch plans");
      }
    } catch {
      toast.error("Unexpected error while fetching plans");
    }
  };

  /** Handle selecting a plan */
  const handlePlanSelect = (plan: any, setFieldValue: any) => {
    setFieldValue("amount", plan.ourPrice);
    setIsModalOpen(false);
    setSelectedPlan(plan);
  };

  return (
    <div className="min-h-screen bg-white">
      <ApHeader title="Buy Cable TV Subscription" />
      <div className="flex bg-[color:var(--brand-50)] justify-center p-4">
        <div className="bg-white p-6 w-full max-w-md rounded-2xl shadow-sm ring-1 ring-slate-100">
          <p className="text-sm text-slate-600 text-center py-2 mb-4">
            Select a provider and enter details to subscribe.
          </p>

          <Formik
            initialValues={{
              smartCardNo: "",
              phone: "",
              amount: "",
            }}
            // validationSchema={validationSchema}
            onSubmit={() => {}}
          >
            {({ setFieldValue, values }) => (
              <Form>
                {/* Providers */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {cableServices.map((provider) => {
                    const label = String(provider?.name || "")
                      .split(" ")[0]
                      .toLowerCase();
                    const isSelected = selectedProvider === provider?.name;

                    return (
                      <button
                        key={provider.name}
                        type="button"
                        className={`group flex flex-col items-center justify-center gap-2 p-3 border-2 rounded-xl transition ${
                          isSelected
                            ? "border-[color:var(--brand-700)] bg-[color:var(--brand-50)]"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                        onClick={() => handleNetworkSelect(provider, setFieldValue)}
                      >
                        <div className="relative flex items-center justify-center">
                          <img
                            src={provider.image}
                            alt={provider.name}
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

                <ApTextInput
                  label="Smartcard Number"
                  name="smartCardNo"
                  type="text"
                  placeHolder="Enter 10-digit Smartcard Number"
                  onChange={(value: string) => {
                    setFieldValue("smartCardNo", value);
                    if (value.length === 10 && selectedProvider) {
                      handleVerify(value);
                    }
                  }}
                />

                {customerDetails.name && (
                  <div className="mt-3 p-4 rounded-2xl bg-slate-50 ring-1 ring-slate-100 space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-500">Name</div>
                      <div className="text-sm font-semibold text-slate-900">
                        {customerDetails.name}
                      </div>
                    </div>
                    {customerDetails.dueDate && (
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-slate-500">Due Date</div>
                        <div className="text-sm font-semibold text-slate-900">
                          {customerDetails.dueDate}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <ApTextInput
                  label="Phone Number"
                  name="phone"
                  placeHolder="Enter 11-digit phone number"
                />

                <ApTextInput
                  label="Amount (₦)"
                  name="amount"
                  placeHolder="Enter Amount"
                  disabled={true}
                />

                <ApButton
                  type="button"
                  className="w-full mt-4"
                  disabled={loading || !selectedProvider || !selectedPlan}
                  onClick={() => {
                    if (!selectedProvider) {
                      toast.error("Please select a provider");
                      return;
                    }
                    if (!selectedPlan) {
                      toast.error("Please select a plan");
                      return;
                    }
                    setFormData(values);
                    setPreviewModalOpen(true);
                  }}
                  title="Continue"
                />

                {/* Modal for Categories & Plans */}
                <GlobalModal
                  title="TV Plans"
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                >
                  <div className="max-h-[60vh] overflow-y-auto">
                    {step === "categories" ? (
                      <div className="space-y-2">
                        {categories.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => handleCategorySelect(c)}
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl ring-1 ring-slate-100 hover:bg-[color:var(--brand-50)] text-left font-semibold text-slate-700"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => setStep("categories")}
                          className="text-[color:var(--brand-700)] text-sm mb-2 font-semibold"
                        >
                          ← Back
                        </button>
                        {plans.map((p, i) => (
                          <button
                            key={i}
                            onClick={() => handlePlanSelect(p, setFieldValue)}
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl ring-1 ring-slate-100 hover:bg-[color:var(--brand-50)] text-left"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-sm font-semibold text-slate-900">
                                {p.name}
                              </div>
                              <div className="text-sm font-extrabold text-[color:var(--brand-700)]">
                                ₦{Number(p.ourPrice ?? 0).toLocaleString()}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </GlobalModal>
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
                  {selectedProvider || "—"}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">Smartcard</div>
                <div className="text-sm font-semibold text-slate-900">
                  {String(formData.smartCardNo || "—")}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">Phone</div>
                <div className="text-sm font-semibold text-slate-900">
                  {String(formData.phone || "—")}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">Plan</div>
                <div className="text-sm font-semibold text-slate-900 text-right">
                  {String(selectedPlan?.name || "—")}
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
    </div>
  );
}
