"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import { ApTextInput } from "@/components/input/textInput";
import { ApButton } from "@/components/button/button";
import ApHeader from "@/components/Apheader";

import {
  purchaseData,
  fetchDataPlans,
  getDataServices,
} from "@/redux/features/easyAccess/service";
import { AppDispatch, RootState } from "@/redux/store";

const durationTabs = ["All", "Daily", "Weekly", "Monthly"] as const;
type DurationTab = (typeof durationTabs)[number];

const getDurationCategory = (validity?: string): DurationTab => {
  const val = (validity || "").toLowerCase();
  const days = parseInt(val);

  if (val.includes("daily")) return "Daily";
  if (val.includes("weekly")) return "Weekly";
  if (val.includes("month")) return "Monthly";

  if (!Number.isNaN(days)) {
    if (days < 7) return "Daily";
    if (days < 30) return "Weekly";
    return "Monthly";
  }

  return "Monthly";
};

export default function EasyAccessBuyData() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { user } = useSelector((state: RootState) => state.auth);
  const plans = useSelector(
    (state: RootState) => state.easyAccessdataPlans.plans
  );

  const dataServices = useSelector(
    (state: RootState) => state.easyAccessdataPlans.dataServices
  );

  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [activeTab, setActiveTab] = useState<DurationTab>("All");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [pinCode, setPinCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(getDataServices("data"));
  }, [dispatch]);

  useEffect(() => {
    if (selectedNetwork) return;
    if (!dataServices.length) return;

    const enabled = dataServices.filter((s: any) => s?.status !== false);
    const mtn =
      enabled.find(
        (s: any) => String(s?.name || "").split(" ")[0].toLowerCase() === "mtn"
      ) || enabled[0];

    if (!mtn) return;

    const provider = String(mtn.name || "").split(" ")[0].toLowerCase();
    if (!provider) return;

    setSelectedNetwork(provider);
    setSelectedPlan(null);
    setActiveTab("All");

    dispatch(fetchDataPlans({ network: provider }));
  }, [dataServices, dispatch, selectedNetwork]);

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

  const initialValues = useMemo(
    () => ({
      phone: "",
      planId: "",
      amount: "",
      network: selectedNetwork || "",
      dataName: "",
    }),
    [selectedNetwork]
  );

  const sortedPlans = useMemo(() => {
    return [...(plans || [])]
      .filter(
        (p: any) =>
          p?.serviceType?.toLowerCase() === "data" &&
          p?.validity &&
          p?.name
      )
      .sort(
        (a: any, b: any) =>
          Number(a.ourPrice ?? a.amount ?? 0) -
          Number(b.ourPrice ?? b.amount ?? 0)
      );
  }, [plans]);

  const visiblePlans = useMemo(() => {
    if (activeTab === "All") return sortedPlans;
    return sortedPlans.filter(
      (p: any) => getDurationCategory(p.validity) === activeTab
    );
  }, [activeTab, sortedPlans]);

  const handleFormSubmit = async (values: any) => {
    if (!pinCode || pinCode.length !== 4) {
      toast.error("Please enter a valid 4-digit PIN");
      return;
    }

    if (!selectedNetwork) {
      toast.error("No network selected");
      return;
    }

    if (!selectedPlan) {
      toast.error("No plan selected");
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
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={() => {}}
            enableReinitialize
          >
            {({ values, setFieldValue }) => (
              <Form>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {dataServices.map((service: any) => {
                    const isDisabled = service.status === false;
                    if (isDisabled) return null;

                    const provider = String(service.name || "")
                      .split(" ")[0]
                      .toLowerCase();

                    return (
                      <button
                        key={service._id}
                        type="button"
                        className={`flex items-center justify-center p-3 border-2 rounded-xl transition ${
                          selectedNetwork === provider
                            ? "border-blue-500"
                            : "border-gray-200"
                        } hover:border-blue-400`}
                        onClick={async () => {
                          setSelectedNetwork(provider);
                          setSelectedPlan(null);
                          setActiveTab("All");
                          setFieldValue("network", provider);
                          setFieldValue("planId", "");
                          setFieldValue("dataName", "");
                          setFieldValue("amount", "");

                          try {
                            const result = await dispatch(
                              fetchDataPlans({
                                network: provider,
                              })
                            );
                            if (!fetchDataPlans.fulfilled.match(result)) {
                              toast.error(
                                result.payload || "Failed to fetch plans"
                              );
                            }
                          } catch {
                            toast.error(
                              "Unexpected error while fetching plans"
                            );
                          }
                        }}
                      >
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-10 h-10 object-contain"
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

                <div className="mt-4">
                  <div className="flex gap-6 overflow-x-auto border-b border-gray-200">
                    {durationTabs.map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className="pb-2"
                      >
                        <span
                          className={`text-sm ${
                            activeTab === tab
                              ? "text-green-600 font-bold"
                              : "text-gray-500"
                          }`}
                        >
                          {tab}
                        </span>
                        {activeTab === tab ? (
                          <div className="h-1 bg-green-600 mt-2 rounded-full" />
                        ) : null}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 max-h-[46vh] overflow-y-auto pr-1 custom-scrollbar overscroll-contain">
                    <div className="grid grid-cols-3 gap-3">
                      {visiblePlans.map((p: any, i: number) => {
                        const isActive = selectedPlan?._id === p?._id;
                        const sizeText =
                          String(p.name || "")
                            .match(/\d+(?:\.\d+)?\s*(GB|MB)/i)?.[0]
                            ?.replace(/\s+/g, "")
                            .toUpperCase() || p.name;

                        return (
                          <button
                            key={p?._id || i}
                            type="button"
                            className={`text-left bg-gray-50 border rounded-2xl p-4 transition ${
                              isActive
                                ? "border-blue-500"
                                : "border-gray-200 hover:border-blue-300"
                            }`}
                            onClick={() => {
                              if (!/^\d{11}$/.test(values.phone || "")) {
                                toast.error(
                                  "Enter a valid 11-digit phone number"
                                );
                                return;
                              }

                              setSelectedPlan(p);
                              setFieldValue("planId", p._id);
                              setFieldValue("dataName", p.name);
                              setFieldValue("amount", p.ourPrice);
                              setFormData({
                                ...values,
                                planId: p._id,
                                dataName: p.name,
                                amount: p.ourPrice,
                                network: selectedNetwork,
                              });
                              setPinCode("");
                              setPinModalOpen(true);
                            }}
                          >
                            <div className="flex flex-col items-center justify-center text-center gap-2">
                              <div className="text-base font-semibold">
                                {sizeText}
                              </div>
                              <div className="inline-flex items-center justify-center bg-green-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                                {p.validity}
                              </div>
                              <div className="text-green-600 font-semibold whitespace-nowrap">
                                ₦{Number(p.ourPrice ?? 0).toLocaleString()}
                              </div>
                            </div>
                          </button>
                        );
                      })}

                      {!visiblePlans.length ? (
                        <div className="col-span-3 py-6 text-center text-sm text-gray-500">
                          {selectedNetwork
                            ? "No plans found for this tab."
                            : "Select a network to see plans."}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

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
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}