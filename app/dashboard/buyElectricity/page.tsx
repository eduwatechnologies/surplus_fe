"use client";

import { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { ApTextInput } from "@/components/input/textInput";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import GlobalModal from "@/components/modal/globalModal";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [pinModalOpen, setPinModalOpen] = useState(false);
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

  // Handle provider selection
  const handleSelectProvider = (
    provider: string,
    setFieldValue: (field: string, value: string) => void,
    planId: string
  ) => {
    setSelectedProvider(provider);
    setSelectedPlanId(planId);
    setFieldValue("company", provider);
    setIsModalOpen(false);
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
        // ✅ success case
        const { transactionId } = resultAction.payload;
        if (transactionId) {
          toast.success("✅ Electricity purchase successful!");
          router.push(`/dashboard/transaction?request_id=${transactionId}`);
        }
      } else {
        // ❌ failure case
        const transactionId = resultAction.payload?.transactionId;
        if (transactionId) {
          router.push(`/dashboard/transaction?request_id=${transactionId}`);
        } else {
          toast.error("❌ Electricity purchase failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("handleFormSubmit error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
      setPinModalOpen(false);
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
      <div className="flex justify-center">
        <div className="bg-white p-6  w-96">
          <Formik
            initialValues={{
              meterno: "",
              company: "",
              metertype: "",
              amount: "",
              phone: "",
            }}
            // validationSchema={validationSchema}
            onSubmit={() => {}}
          >
            {({ values, setFieldValue, isValid, dirty }) => (
              <Form>
                {/* Meter Number */}
                <ApTextInput
                  label="Meter Number"
                  name="meterno"
                  type="text"
                  placeHolder="Enter your meter number"
                />

                {/* Customer Details */}
                {isMeterVerified && (
                  <div className="mt-3 p-3 bg-gray-100 rounded-md">
                    <p className="text-sm text-gray-700">
                      <strong>Name:</strong> {customerDetails.name || "N/A"}
                    </p>
                  </div>
                )}

                {/* Provider Selection */}
                <label className="block text-sm font-medium text-gray-700 mt-2">
                  Select Provider
                </label>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full p-2 border border-gray-300 rounded-md text-left bg-white"
                >
                  {selectedProvider || "Select Provider"}
                </button>

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
                <label className="block text-sm font-medium text-gray-700 mt-2">
                  Select Meter Type
                </label>
                <div className="flex space-x-4">
                  {["prepaid", "postpaid"].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="radio"
                        name="metertype"
                        value={type}
                        checked={values.metertype === type}
                        onChange={() =>
                          handleTypeChange(type, values, setFieldValue)
                        }
                        className="mr-2"
                      />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>

                {/* Continue Button */}
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

                {/* Provider Modal */}
                <GlobalModal
                  title="Select Electricity Provider"
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                >
                  <ul className="space-y-2">
                    {electricityServices.map((provider) => (
                      <li
                        key={provider.id}
                        className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition cursor-pointer flex justify-between items-center"
                        onClick={() => {
                          handleSelectProvider(
                            provider.name,
                            setFieldValue,
                            provider._id
                          );
                        }}
                      >
                        <span className="capitalize">{provider.name}</span>
                      </li>
                    ))}
                  </ul>
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
