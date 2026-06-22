import PayOS from "@payos/node";
import { payosConfig } from "./config";

let client: PayOS | null = null;

export function payos(): PayOS {
  if (!client) {
    client = new PayOS(
      payosConfig.clientId(),
      payosConfig.apiKey(),
      payosConfig.checksumKey()
    );
  }
  return client;
}

// PayOS requires a numeric orderCode (<= 9007199254740991). A second-precision
// timestamp plus 3 random digits is unique enough for a single-seller store and
// stays well under the limit.
export function newOrderCode(): number {
  const seconds = Math.floor(Date.now() / 1000); // ~10 digits
  const rand = Math.floor(Math.random() * 1000); // 0..999
  return seconds * 1000 + rand;
}
