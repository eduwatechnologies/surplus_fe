export const electricityProviders = [
  { id: "IKEDC", name: "Ikeja Electric", image: "/images/ikedc.png" },
  { id: "EKEDC", name: "Eko Electric", image: "/images/ekedc.png" },
  { id: "KEDCO", name: "Kano Electric", image: "/images/kedco.png" },
  { id: "PHED", name: "PortHarcourt Electric", image: "/images/phed.png" },
  { id: "JED", name: "Jos Electric", image: "/images/jed.png" },
  { id: "IBEDC", name: "Ibadan Electric", image: "/images/ibedc.png" },
  { id: "KAEDCO", name: "Kaduna Electric", image: "/images/kaedco.png" },
  { id: "AEDC", name: "Abuja Electric", image: "/images/aedc.png" },
  { id: "EEDC", name: "Enugu Electric", image: "/images/eedc.png" },
  { id: "BEDC", name: "Benin Electric", image: "/images/bedc.png" },
  { id: "ABA", name: "Aba Electric", image: "/images/aba.png" },
  { id: "YEDC", name: "Yola Electric", image: "/images/yedc.png" },
];


export const promoData = [
  {
    id: 1,
    image: "/images/airtel.png",
    title: "50% Off on All Data Plans!",
    link: "/promo/data-sale",
  },
  {
    id: 2,

    image: "/images/airtel.png",

    title: "Buy Airtime, Get Cashback",
    link: "/promo/cashback",
  },
  {
    id: 3,
    image: "/images/mtn.png",

    title: "Refer & Earn Rewards",
    link: "/promo/refer",
  },
];

export type NetworkKey = "Mtn" | "Glo" | "Airtel" | "Mobile9";

export const Networks: Record<NetworkKey, string[]> = {
  Mtn: ["mtn_sme", "mtn_cg_lite", "mtn_cg", "mtn_awoof", "mtn_gifting"],
  Glo: ["glo_cg", "glo_awoof", "glo_gifting"],
  Airtel: ["airtel_cg", "airtel_awoof", "airtel_gifting"],
  Mobile9: ["9mobile_sme", "9mobile_gifting"],
};

export const banksInfo = [
  {
    bank: "PALMPAY",
    logo: "/images/palmpay.png",
    note: "Your PalmPay virtual account",
    name:"PALMPAY Bank"
  },
  {
    bank: "9PSB",
    logo: "/images/9psb.png",
    note: "Your 9PSB virtual account",
    name:"9PSB Bank"
  },
];


const serviceImages: Record<string, string> = {
  // Data & Airtime
  mtn: "/images/mtn.png",
  airtel: "/images/airtel.png",
  glo: "/images/glo.jpg",
  "9mobile": "/images/9mobile.jpeg",

  // Electricity
  ikeja: "/images/ikeja.png",
  eko: "/images/eko.png",
  abuja: "/images/abuja.png",
  kano: "/images/kano.png",

  // Cable
  dstv: "/images/dstv.png",
  gotv: "/images/gotv.png",
  startimes: "/images/startimes.png",
  showmax: "/images/showmax.png",

  // Exam
  waec: "/images/waec.png",
  neco: "/images/neco.png",
  nabteb: "/images/nabteb.png",
};





