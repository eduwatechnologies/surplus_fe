import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MerchantStorefrontView } from "./m/[slug]/page";

export default async function Home() {
  const h = await headers();
  const rawHost = (h.get("x-forwarded-host") || h.get("host") || "").trim();
  const host = rawHost.split(",")[0].split(":")[0].toLowerCase();
  const baseHost = host.startsWith("www.") ? host.slice(4) : host;

  if (baseHost && !baseHost.includes("localhost")) {
    const parts = baseHost.split(".").filter(Boolean);
    if (parts.length >= 3) {
      const tenantSlug = parts[0];
      return <MerchantStorefrontView slug={tenantSlug} />;
    }
  }

  redirect("/m");
}
