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
  downloadUrlMac: optional(
    "DOWNLOAD_URL_MAC",
    "https://github.com/kaisye/VietDubPublic/releases/latest/download/VietDub_0.1.7_aarch64.dmg"
  ),
  zaloGroupUrl: optional("ZALO_GROUP_URL", ""),
  demoVideoUrl: optional("DEMO_VIDEO_URL", ""),
  facebookUrl: optional("FACEBOOK_URL", ""),
  tutorialVideoUrl: optional("TUTORIAL_VIDEO_URL", ""),
};

// Password protecting the /admin dev page. Empty → admin page disabled.
export const adminPassword = optional("ADMIN_PASSWORD", "");

export const payosConfig = {
  clientId: () => required("PAYOS_CLIENT_ID"),
  apiKey: () => required("PAYOS_API_KEY"),
  checksumKey: () => required("PAYOS_CHECKSUM_KEY"),
};

export const sheetsConfig = {
  // Accept either the bare Sheet ID or a full spreadsheet URL pasted by mistake.
  sheetId: () => {
    const raw = required("GOOGLE_SHEET_ID").trim();
    const m = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return m ? m[1] : raw;
  },
  clientEmail: () => {
    const e = required("GOOGLE_SERVICE_ACCOUNT_EMAIL").trim().replace(/^["']|["']$/g, "");
    if (!e.includes("gserviceaccount.com")) {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_EMAIL phải là email service account (kết thúc bằng .iam.gserviceaccount.com), lấy từ file JSON — không phải email cá nhân."
      );
    }
    return e;
  },
  // Normalise the PEM key from any common paste format: strip wrapping quotes,
  // turn literal \n (and \r\n) into real newlines.
  privateKey: () => {
    let k = required("GOOGLE_PRIVATE_KEY").trim();
    if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
      k = k.slice(1, -1);
    }
    // Normalise newlines from every paste/loader combination we've seen:
    //  - literal "\n" / "\\n" (single or double-escaped)
    //  - "\" left in front of a real newline (dotenv mangling a double-escaped,
    //    double-quoted value)
    //  - CRLF
    k = k
      .replace(/\\\\r\\\\n/g, "\n")
      .replace(/\\\\n/g, "\n")
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\\r?\n/g, "\n")
      .replace(/\r\n/g, "\n");
    // Extract just the PEM block so stray wrapping quotes/whitespace (from a
    // double-wrapped or editor-mangled value) can never break decoding.
    const pem = k.match(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/);
    if (pem) k = pem[0] + "\n";
    if (k.includes("...") || !k.includes("BEGIN PRIVATE KEY")) {
      throw new Error(
        "GOOGLE_PRIVATE_KEY chưa có key thật (vẫn là giá trị mẫu). Dán nguyên private_key từ file JSON service account vào .env.local, dạng một dòng trong dấu nháy kép."
      );
    }
    return k;
  },
};

export const mailConfig = {
  user: optional("SMTP_USER"),
  pass: optional("SMTP_PASS"),
  fromName: optional("MAIL_FROM_NAME", "VietDub"),
  enabled: () => Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
};

export const webhookToken = optional("WEBHOOK_TOKEN");
