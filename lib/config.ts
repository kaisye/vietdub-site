// Centralised access to environment config. Anything secret is read on the
// server only; values prefixed NEXT_PUBLIC_ are safe for the browser.
//
// Business settings that you may want to change often (price, promo, links) are
// NOT pinned here — they live in the "Settings" tab of the Google Sheet and are
// editable from the /admin page without a redeploy. The values below are only
// the first-run DEFAULTS used to seed that tab.

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Thiếu biến môi trường: ${name}`);
  return v;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const siteUrl = optional("NEXT_PUBLIC_SITE_URL", "http://localhost:3000").replace(/\/$/, "");

// First-run defaults for the editable business settings (see lib/settings.ts).
export const envDefaults = {
  productName: optional("PRODUCT_NAME", "VietDub"),
  basePrice: Number(optional("BASE_PRICE", "499000")),
  promoPrice: Number(optional("PROMO_PRICE", "249000")),
  promoDays: Number(optional("PROMO_DAYS", "7")),
  promoEndsAt: optional("PROMO_ENDS_AT", ""), // empty → seed = now + promoDays
  downloadUrl: optional(
    "DOWNLOAD_URL",
    "https://github.com/kaisye/VietDubPublic/releases/latest/download/VietDub_0.1.7_x64-setup.exe"
  ),
  zaloGroupUrl: optional("ZALO_GROUP_URL", ""),
};

// Password protecting the /admin dev page. Empty → admin page disabled.
export const adminPassword = optional("ADMIN_PASSWORD", "");

export const payosConfig = {
  clientId: () => required("PAYOS_CLIENT_ID"),
  apiKey: () => required("PAYOS_API_KEY"),
  checksumKey: () => required("PAYOS_CHECKSUM_KEY"),
};

export const sheetsConfig = {
  sheetId: () => required("GOOGLE_SHEET_ID"),
  clientEmail: () => required("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
  // The private key is stored with literal \n; turn them back into newlines.
  privateKey: () => required("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n"),
};

export const mailConfig = {
  user: optional("SMTP_USER"),
  pass: optional("SMTP_PASS"),
  fromName: optional("MAIL_FROM_NAME", "VietDub"),
  enabled: () => Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
};

export const webhookToken = optional("WEBHOOK_TOKEN");
