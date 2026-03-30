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
import { detectNetwork } from "@/utils/networkChecker";

interface FormValues {
  phone: string;
  amount: string;
  network: string;
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
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [pinCode, setPinCode] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");

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

  const handleFormSubmit = async (values: any) => {
    if (!pinCode || pinCode.length !== 4) {
      toast.error("Please enter a valid 4-digit PIN");
      return;
    }

    const payload = {
      ...values,
      networkId: selectedNetwork,
      userId: user?._id,
      amount: Number(values.amount),
      pinCode,
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
      setPinCode("");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ApHeader title="Buy Airtime" />
      <div className="flex bg-gray-100">
        <div className="bg-white p-6 w-full max-w-md">
          <p className="text-sm text-gray-600 text-center py-2 mb-4">
            Select your network, enter your number and amount, and complete with
            your PIN.
          </p>

          <Formik
            initialValues={{ phone: "", amount: "", network: "" }}
            validationSchema={validationSchema}
            onSubmit={() => {}}
          >
            {({ values, setFieldValue, isValid, dirty }) => {
              const discountPercentage = 2;
              const discount =
                (Number(values.amount) * discountPercentage) / 100;
              const finalAmount = Math.max(0, Number(values.amount) - discount);

              return (
                <Form>
                  {/* Network Logos */}
                  <div className="flex flex-wrap justify-center gap-4 mb-4">
                    {dataServices.map((service: any) => (
                      <button
                        key={service._id}
                        type="button"
                        className={`flex items-center justify-center p-3 border-2 rounded-xl ${
                          selectedNetwork === service.name
                            ? "border-blue-500"
                            : "border-gray-200"
                        }`}
                        onClick={() => {
                          const provider = service.name
                            .split(" ")[0]
                            .toLowerCase();
                          setSelectedNetwork(provider);
                          setFieldValue(
                            "network",
                            service.name.split(" ")[0].toUpperCase()
                          );
                        }}
                      >
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-10 h-10 object-contain"
                        />
                      </button>
                    ))}
                  </div>

                  <ApTextInput
                    label="Network"
                    name="network"
                    placeHolder="Select network"
                    readOnly={true}
                    value={values.network}
                  />

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

                  <div className="mt-1 text-md font-semibold">
                    Final Amount: ₦{finalAmount}
                  </div>

                  <ApButton
                    type="button"
                    className="w-full mt-4"
                    disabled={loading || !isValid || !dirty}
                    onClick={() => {
                      setFormData({ ...values });
                      setPinModalOpen(true);
                    }}
                    title="Continue"
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
