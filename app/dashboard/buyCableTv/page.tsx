"use client";

import { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { ApTextInput } from "@/components/input/textInput";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  getServiceVariations,
  subscribeCable,
} from "@/redux/features/services/serviceThunk";
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
      <div className="flex justify-center">
        <div className="bg-white p-6  w-96">
          <p className="text-sm text-gray-600 text-center py-2 mb-4">
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
            {({ setFieldValue, values, isValid, dirty, handleSubmit }) => (
              <Form>
                {/* Providers */}
                <div className="flex justify-center space-x-4 mb-4">
                  {cableServices.map((provider) => (
                    <button
                      key={provider.name}
                      type="button"
                      className={`p-2 rounded-lg border ${
                        selectedProvider === provider.name
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300"
                      } hover:border-blue-500 transition-colors`}
                      onClick={() =>
                        handleNetworkSelect(provider, setFieldValue)
                      }
                    >
                      <img
                        src={provider.image}
                        alt={provider.name}
                        className="w-12 h-12 object-contain"
                      />
                    </button>
                  ))}
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
                  <div className="mt-3 p-3 bg-gray-100 rounded-md space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Name:</span>{" "}
                      {customerDetails.name}
                    </p>
                    {customerDetails.dueDate && (
                      <p className="text-sm">
                        <span className="font-medium">Due Date:</span>{" "}
                        {customerDetails.dueDate}
                      </p>
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
                  disabled={loading || !isValid || !dirty}
                  onClick={() => {
                    setFormData(values);
                    setPinModalOpen(true);
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
                            className="w-full px-4 py-3 bg-gray-100 rounded-lg hover:bg-blue-50"
                          >
                            {c}
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
