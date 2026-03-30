"use client";

import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import { ApTextInput } from "@/components/input/textInput";
import { ApButton } from "@/components/button/button";
import ApHeader from "@/components/Apheader";
import GlobalModal from "@/components/modal/globalModal";

import {
  purchaseData,
  fetchDataPlans,
  fetchDataCategories,
  getDataServices,
} from "@/redux/features/easyAccess/service";
import { AppDispatch, RootState } from "@/redux/store";

type Step = "categories" | "plans";

export default function EasyAccessBuyData() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { user } = useSelector((state: RootState) => state.auth);
  const plans = useSelector(
    (state: RootState) => state.easyAccessdataPlans.plans
  );

  // Select the list of data services from redux
  const dataServices = useSelector(
    (state: RootState) => state.easyAccessdataPlans.dataServices
  );

  const purchaseError = useSelector(
    (state: RootState) => state.easyAccessdataPlans.purchaseError
  );

  React.useEffect(() => {
    dispatch(getDataServices("data"));
  }, [dispatch]);

  // UI States
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [step, setStep] = useState<Step>("categories");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Input & form states
  const [formData, setFormData] = useState<any>(null);
  const [pinCode, setPinCode] = useState("");
  const [loading, setLoading] = useState(false);

  /** Format helper */
  const formatText = (text: string) =>
    text
      .replace(/^(mtn_|glo_|airtel_|9mobile_)/i, "")
      .replaceAll("_", " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  /** Validation schema */
  const validationSchema = Yup.object({
    phone: Yup.string()
      .matches(/^[0-9]{11}$/, "Phone number must be 11 digits")
      .required("Phone number is required"),
    planId: Yup.string().required("Plan is required"),
    amount: Yup.number()
      .min(50, "Minimum amount is ₦50")
      .required("Amount is required"),
    network: Yup.string().required("Network is required"),
  });

  /** Handle selecting a network */
  const handleNetworkSelect = async (
    networkLabel: string,
    setFieldValue: any,
    networkValue: string,
    service: string
  ) => {
    setSelectedService(service); // save the whole object
    setSelectedNetwork(networkLabel);
    setIsModalOpen(true);
    setStep("categories");
    setFieldValue("network", networkValue);

    try {
      const result = await dispatch(
        fetchDataCategories({ network: networkLabel, serviceType: "data" })
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

  /** Handle selecting a category */
  const handleCategorySelect = async (category: string) => {
    try {
      const result = await dispatch(
        fetchDataPlans({ network: selectedNetwork, category })
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
    // setFieldValue("pl")
    setFieldValue("amount", plan.ourPrice);
    setFieldValue("dataName", plan.name);
    setIsModalOpen(false);
    setSelectedPlan(plan);
  };

  /** Handle submitting purchase */
  const handleFormSubmit = async (values: any) => {
    if (!pinCode || pinCode.length !== 4) {
      toast.error("Please enter a valid 4-digit PIN");
      return;
    }

    if (!selectedService) {
      toast.error("No network selected");
      return;
    }

    const payload = {
      networkId: selectedNetwork,
      userId: user?._id,
      dataType: selectedPlan.category,
      planId: selectedPlan._id,
      phone: values.phone,
      amount: values.amount,
      pinCode,
    };

    try {
      setLoading(true);
      const resultAction = await dispatch(purchaseData(payload as any));

      if (purchaseData.fulfilled.match(resultAction)) {
        toast.success("Data purchase successful!");
        const { transactionId } = resultAction.payload;
        router.push(`/dashboard/transaction?request_id=${transactionId}`);
      } else {
        console.log(resultAction.payload);
        toast.error(resultAction.payload?.error || "Purchase failed...!");
        const transactionId = resultAction.payload?.transactionId;
        if (transactionId) {
          router.push(`/dashboard/transaction?request_id=${transactionId}`);
        } else {
          console.warn("⚠️ No transactionId returned for failed transaction.");
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
      setPinModalOpen(false);
      setPinCode("");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ApHeader title="Buy Data" />
      <div className="flex flex-col items-center p-4">
        <div className="w-full max-w-md">
          <p className="text-sm text-gray-600 text-center py-2 mb-4">
            Select your network and plan, enter your number, and complete with
            your PIN.
          </p>
          <Formik
            initialValues={{ phone: "", planId: "", amount: "", network: "" }}
            validationSchema={validationSchema}
            onSubmit={() => {}}
          >
            {({ values, setFieldValue }) => (
              <Form>
                {/* NETWORK SELECTION */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {dataServices.map((service: any) => {
                    const isDisabled = service.status === false; // false means unclickable

                    return (
                      <button
                        key={service._id}
                        type="button"
                        disabled={isDisabled}
                        className={`flex items-center justify-center p-3 border-2 rounded-xl transition
          ${
            selectedNetwork === service.name
              ? "border-blue-500"
              : "border-gray-200"
          }
          ${
            isDisabled
              ? "hidden cursor-not-allowed opacity-50"
              : "hover:border-blue-400"
          }
        `}
                        onClick={() => {
                          if (isDisabled) return; // Prevent click
                          const provider = service.name
                            .split(" ")[0]
                            .toLowerCase();
                          handleNetworkSelect(
                            provider,
                            setFieldValue,
                            provider,
                            service
                          );
                        }}
                      >
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-10 h-10 object-contain"
                          style={{
                            pointerEvents: isDisabled ? "none" : "auto",
                            opacity: isDisabled ? 0.5 : 1,
                          }}
                        />
                      </button>
                    );
                  })}
                </div>

                <ApTextInput
                  label="Phone Number"
                  name="phone"
                  type="text"
                  placeHolder="Enter phone number"
                />

                <ApTextInput
                  label="Data Plan"
                  name="dataName"
                  readOnly={true}
                  type="text"
                  placeHolder="Enter phone number"
                />

                <ApTextInput
                  label="Amount (₦)"
                  name="amount"
                  readOnly={true}
                  placeHolder="e.g. 500"
                />

                <ApButton
                  title="Continue"
                  className="w-full mt-4"
                  disabled={loading}
                  type="button"
                  onClick={() => {
                    setFormData(values);
                    setPinModalOpen(true);
                  }}
                />

                {/* PIN MODAL */}
                {pinModalOpen && (
                  <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center"
                    onClick={(e) =>
                      e.target === e.currentTarget && setPinModalOpen(false)
                    }
                  >
                    <div className="bg-white p-6 rounded-2xl w-full max-w-xs">
                      <h2 className="text-lg font-semibold mb-4 text-center">
                        Enter Your 4-digit PIN
                      </h2>
                      <input
                        type="password"
                        value={pinCode}
                        onChange={(e) =>
                          /^\d{0,4}$/.test(e.target.value) &&
                          setPinCode(e.target.value)
                        }
                        maxLength={4}
                        inputMode="numeric"
                        className="w-full p-3 text-xl text-center border-2 rounded-lg tracking-widest"
                        placeholder="••••"
                        autoFocus
                      />
                      <div className="flex gap-4 mt-4">
                        <ApButton
                          title="Cancel"
                          className="w-1/2 bg-gray-100 text-gray-600"
                          onClick={() => {
                            setPinModalOpen(false);
                            setPinCode("");
                          }}
                        />
                        <ApButton
                          title={loading ? "Processing..." : "Submit"}
                          className="w-1/2 bg-blue-600 text-white"
                          disabled={loading || pinCode.length !== 4}
                          type="button"
                          onClick={() => formData && handleFormSubmit(formData)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* MODAL FOR CATEGORIES & PLANS */}
                <GlobalModal
                  title={`Choose Plan (${selectedNetwork})`}
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
                            className="w-full px-4 py-3 bg-gray-100 rounded-lg hover:bg-blue-50"
                          >
                            {formatText(c)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => setStep("categories")}
                          className="text-blue-500 text-sm mb-2"
                        >
                          ← Back
                        </button>
                        {plans.map((p, i) => (
                          <button
                            key={i}
                            onClick={() => handlePlanSelect(p, setFieldValue)}
                            className="w-full px-4 py-3 bg-gray-100 rounded-lg hover:bg-blue-50"
                          >
                            {p.name} — ₦{p.ourPrice}
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
    </div>
  );
}
