// utils/networkChecker.ts

// Define prefixes for Nigerian networks (you can update this list as needed)
const networkPrefixes: Record<string, string[]> = {
  mtn: [
    "0803",
    "0806",
    "0703",
    "0706",
    "0810",
    "0813",
    "0814",
    "0816",
    "0903",
    "0906",
    "0913",
    "0916",
  ],
  glo: ["0805", "0807", "0705", "0811", "0815", "0905"],
  airtel: [
    "0802",
    "0808",
    "0708",
    "0812",
    "0701",
    "0902",
    "0907",
    "0901",
    "0912",
  ],
  "9mobile": ["0809", "0817", "0818", "0909", "0908"],
};

export function detectNetwork(phone: string): string | null {
  const clean = phone.trim();

  for (const [network, prefixes] of Object.entries(networkPrefixes)) {
    if (prefixes.some((p) => clean.startsWith(p))) {
      return network;
    }
  }

  return null;
}
