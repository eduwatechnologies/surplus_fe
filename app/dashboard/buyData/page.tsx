"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  fetchDataCategories,
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
  const plansLoading = useSelector(
    (state: RootState) => state.easyAccessdataPlans.loading
  );
  const plansError = useSelector(
    (state: RootState) => state.easyAccessdataPlans.error
  );

  const dataServices = useSelector(
    (state: RootState) => state.easyAccessdataPlans.dataServices
  );

  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [activeTab, setActiveTab] = useState<DurationTab>("All");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [pinCode, setPinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const plansScrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollMeta, setScrollMeta] = useState({
    isScrollable: false,
    thumbSizePct: 100,
    thumbTopPct: 0,
  });

  const normalizeNetwork = (value: string) =>
    String(value || "")
      .split(" ")[0]
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase();

  const loadPlansForNetwork = async (provider: string) => {
    const network = normalizeNetwork(provider);
    if (!network) return;

    try {
      const categoriesResult = await dispatch(
        fetchDataCategories({ serviceType: "data", network })
      );

      if (fetchDataCategories.fulfilled.match(categoriesResult)) {
        const categories = categoriesResult.payload || [];
        const preferredCategory =
          categories.find(
            (c) => String(c || "").trim().toLowerCase() === "sme"
          ) || categories[0];

        const plansResult = await dispatch(
          fetchDataPlans({
            network,
            category: preferredCategory,
          })
        );

        if (!fetchDataPlans.fulfilled.match(plansResult)) {
          toast.error(plansResult.payload || "Failed to fetch plans");
        }
        return;
      }

      const fallbackResult = await dispatch(fetchDataPlans({ network }));
      if (!fetchDataPlans.fulfilled.match(fallbackResult)) {
        toast.error(fallbackResult.payload || "Failed to fetch plans");
      }
    } catch {
      toast.error("Unexpected error while fetching plans");
    }
  };

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

    const provider = normalizeNetwork(String(mtn.name || ""));
    if (!provider) return;

    setSelectedNetwork(provider);
    setSelectedPlan(null);
    setActiveTab("All");

    void loadPlansForNetwork(provider);
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
      .filter((p: any) => {
        if (!p) return false;
        const serviceType = String(p?.serviceType || "").toLowerCase();
        const looksLikeData = !serviceType || serviceType === "data";
        const hasName = Boolean(p?.name || p?.dataName || p?.planName);
        return looksLikeData && hasName;
      })
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

  const updateScrollMeta = () => {
    const el = plansScrollRef.current;
    if (!el) return;

    const scrollHeight = el.scrollHeight || 0;
    const clientHeight = el.clientHeight || 0;
    const maxScroll = Math.max(0, scrollHeight - clientHeight);
    const isScrollable = maxScroll > 0;
    const ratio = isScrollable ? el.scrollTop / maxScroll : 0;
    const thumbSizePct = scrollHeight
      ? Math.max(18, (clientHeight / scrollHeight) * 100)
      : 100;
    const thumbTopPct = (100 - thumbSizePct) * ratio;

    setScrollMeta({
      isScrollable,
      thumbSizePct: Math.min(100, thumbSizePct),
      thumbTopPct: Math.max(0, Math.min(100 - thumbSizePct, thumbTopPct)),
    });
  };

  useEffect(() => {
    updateScrollMeta();
  }, [visiblePlans.length, plansLoading, activeTab, selectedNetwork]);

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
      setPreviewModalOpen(false);
      setPinCode("");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ApHeader title="Buy Data" />
      <div className="flex flex-col items-center p-4">
        <div className="w-full max-w-md">

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={() => {}}
            enableReinitialize
          >
              <Form className="flex flex-col">
                <div className="grid grid-cols-4 gap-4 mb-4 shrink-0">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {dataServices.map((service: any) => {
                    const isDisabled = service.status === false;

                    const provider = normalizeNetwork(String(service.name || ""));
                    const isSelected = selectedNetwork === provider;

                    return (
                      <button
                        key={service._id}
                        type="button"
                        className={`group flex flex-col items-center justify-center gap-2 p-3 border-2 rounded-xl transition ${
                          isSelected
                            ? "border-[color:var(--brand-700)] bg-[color:var(--brand-50)]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={async () => {
                          setSelectedNetwork(provider);
                          setSelectedPlan(null);
                          setActiveTab("All");
                          setFieldValue("network", provider);
                          setFieldValue("planId", "");
                          setFieldValue("dataName", "");
                          setFieldValue("amount", "");

                          await loadPlansForNetwork(provider);
                        }}
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
                              : "text-gray-600 group-hover:text-gray-800"
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
                />

                <div className="mt-4 shrink-0">
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
                              ? "text-[color:var(--brand-700)] font-bold"
                              : "text-gray-500"
                          }`}
                        >
                          {tab}
                        </span>
                        {activeTab === tab ? (
                          <div className="h-1 bg-[color:var(--brand-600)] mt-2 rounded-full" />
                        ) : null}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 relative h-[52vh] overflow-hidden">
                    {scrollMeta.isScrollable ? (
                      <div className="pointer-events-none absolute right-1 top-2 bottom-2 w-1 rounded-full bg-slate-200/70">
                        <div
                          className="absolute left-0 w-full rounded-full bg-[color:var(--brand-600)]"
                          style={{
                            height: `${scrollMeta.thumbSizePct}%`,
                            transform: `translateY(${scrollMeta.thumbTopPct}%)`,
                          }}
                        />
                      </div>
                    ) : null}
                    <div
                      ref={plansScrollRef}
                      onScroll={updateScrollMeta}
                      className="plans-scroll h-full overflow-y-auto pr-4 overscroll-contain"
                    >
                    <div className="grid grid-cols-3 gap-3">
                      {plansLoading ? (
                        <div className="col-span-3 py-6 text-center text-sm text-gray-500">
                          Loading plans...
                        </div>
                      ) : null}
                      {visiblePlans.map((p: any, i: number) => {
                        const isActive = selectedPlan?._id === p?._id;
                        const planName = String(
                          p?.name || p?.dataName || p?.planName || ""
                        );
                        const planPrice = Number(
                          p?.ourPrice ?? p?.amount ?? p?.price ?? 0
                        );
                        const sizeText =
                          planName
                            .match(/\d+(?:\.\d+)?\s*(GB|MB)/i)?.[0]
                            ?.replace(/\s+/g, "")
                            .toUpperCase() || planName;

                        return (
                          <button
                            key={p?._id || i}
                            type="button"
                            className={`text-left bg-gray-50 border rounded-2xl p-4 transition ${
                              isActive
                                ? "border-[color:var(--brand-700)] bg-[color:var(--brand-50)]"
                                : "border-gray-200 hover:border-gray-300"
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
                              setFieldValue("dataName", planName);
                              setFieldValue("amount", planPrice);
                              setFormData({
                                ...values,
                                planId: p._id,
                                dataName: planName,
                                amount: planPrice,
                                network: selectedNetwork,
                              });
                              setPinCode("");
                              setPreviewModalOpen(true);
                            }}
                          >
                            <div className="flex flex-col items-center justify-center text-center gap-2">
                              <div className="text-base font-semibold">
                                {sizeText}
                              </div>
                              <div className="inline-flex items-center justify-center bg-[color:var(--brand-50)] text-[color:var(--brand-700)] text-xs px-3 py-1 rounded-full">
                                {p.validity || "—"}
                              </div>
                              <div className="text-[color:var(--brand-700)] font-semibold whitespace-nowrap">
                                ₦{Number(planPrice || 0).toLocaleString()}
                              </div>
                            </div>
                          </button>
                        );
                      })}

                      {!visiblePlans.length ? (
                        <div className="col-span-3 py-6 text-center text-sm text-gray-500">
                          {plansError
                            ? String(plansError)
                            : selectedNetwork
                              ? "No plans found for this tab."
                              : "Select a network to see plans."}
                        </div>
                      ) : null}
                    </div>
                  </div>
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
                          <div className="text-xs text-slate-500">Network</div>
                          <div className="text-sm font-semibold text-slate-900">
                            {String(formData.network || "—").toUpperCase()}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="text-xs text-slate-500">Plan</div>
                          <div className="text-sm font-semibold text-slate-900 text-right">
                            {String(formData.dataName || "—")}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="text-xs text-slate-500">Validity</div>
                          <div className="text-sm font-semibold text-slate-900">
                            {String(selectedPlan?.validity || "—")}
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
                          className="w-1/2 bg-[color:var(--brand-600)] hover:bg-[color:var(--brand-700)] text-white"
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
      <style jsx>{`
        .plans-scroll {
          scrollbar-width: thin;
          scrollbar-color: var(--brand-600) rgba(148, 163, 184, 0.25);
        }
        .plans-scroll::-webkit-scrollbar {
          width: 10px;
        }
        .plans-scroll::-webkit-scrollbar-track {
          background: rgba(148, 163, 184, 0.18);
          border-radius: 9999px;
        }
        .plans-scroll::-webkit-scrollbar-thumb {
          background: var(--brand-600);
          border-radius: 9999px;
          border: 3px solid rgba(255, 255, 255, 0.7);
        }
        .plans-scroll::-webkit-scrollbar-thumb:hover {
          background: var(--brand-700);
        }
      `}</style>
    </div>
  );
}
