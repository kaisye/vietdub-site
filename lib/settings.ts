import { sheetsApi, ensureTab } from "./google";
import { sheetsConfig, envDefaults } from "./config";

// Editable business settings, stored as key/value rows in the "Settings" tab of
// the Google Sheet. Edit them from /admin (or directly in the sheet) — changes
// take effect within ~30s, no redeploy needed.
const TAB = "Settings";
const RANGE = `${TAB}!A1:B13`;

export interface Settings {
  productName: string;
  basePrice: number; // giá gốc
  promoPrice: number; // giá khuyến mãi
  promoEndsAt: string; // ISO; "" = không hết hạn
  downloadUrl: string; // Windows (.exe)
  downloadUrlMac: string; // macOS (.dmg)
  zaloGroupUrl: string;
  demoVideoUrl: string; // YouTube hoặc link mp4; "" = ẩn mục demo
  facebookUrl: string; // trang demo video lồng tiếng; "" = ẩn link
  tutorialVideoUrl: string; // YouTube private link hướng dẫn set up; "" = không gửi kèm email
}

export interface Pricing {
  price: number; // số tiền khách trả ngay bây giờ
  basePrice: number;
  promoActive: boolean;
  promoEndsAt: string;
  discountPercent: number;
}

// Order matters: this is the row layout written to A1:B6.
const ROWS: { key: string; get: (s: Settings) => string }[] = [
  { key: "product_name", get: (s) => s.productName },
  { key: "base_price", get: (s) => String(s.basePrice) },
  { key: "promo_price", get: (s) => String(s.promoPrice) },
  { key: "promo_ends_at", get: (s) => s.promoEndsAt },
  { key: "download_url", get: (s) => s.downloadUrl },
  { key: "download_url_mac", get: (s) => s.downloadUrlMac },
  { key: "zalo_group_url", get: (s) => s.zaloGroupUrl },
  { key: "demo_video_url", get: (s) => s.demoVideoUrl },
  { key: "facebook_url", get: (s) => s.facebookUrl },
  { key: "tutorial_video_url", get: (s) => s.tutorialVideoUrl },
];

function defaults(): Settings {
  let promoEndsAt = envDefaults.promoEndsAt;
  if (!promoEndsAt && envDefaults.promoDays > 0) {
    const d = new Date();
    d.setDate(d.getDate() + envDefaults.promoDays);
    promoEndsAt = d.toISOString();
  }
  return {
    productName: envDefaults.productName,
    basePrice: envDefaults.basePrice,
    promoPrice: envDefaults.promoPrice,
    promoEndsAt,
    downloadUrl: envDefaults.downloadUrl,
    downloadUrlMac: envDefaults.downloadUrlMac,
    zaloGroupUrl: envDefaults.zaloGroupUrl,
    demoVideoUrl: envDefaults.demoVideoUrl,
    facebookUrl: envDefaults.facebookUrl,
    tutorialVideoUrl: envDefaults.tutorialVideoUrl,
  };
}

function fromMap(map: Record<string, string>): Settings {
  const d = defaults();
  return {
    productName: map["product_name"] || d.productName,
    basePrice: Number(map["base_price"] || d.basePrice),
    promoPrice: Number(map["promo_price"] || d.promoPrice),
    promoEndsAt: map["promo_ends_at"] ?? d.promoEndsAt,
    downloadUrl: map["download_url"] || d.downloadUrl,
    downloadUrlMac: map["download_url_mac"] || d.downloadUrlMac,
    zaloGroupUrl: map["zalo_group_url"] ?? d.zaloGroupUrl,
    demoVideoUrl: map["demo_video_url"] ?? d.demoVideoUrl,
    facebookUrl: map["facebook_url"] ?? d.facebookUrl,
    tutorialVideoUrl: map["tutorial_video_url"] ?? d.tutorialVideoUrl,
  };
}

// Small in-memory cache so the landing page does not hit the Sheets API on every
// request. TTL is short so admin edits show up quickly.
let cache: { value: Settings; at: number } | null = null;
const TTL_MS = 30_000;

async function writeAll(s: Settings): Promise<void> {
  await ensureTab(TAB);
  await sheetsApi().spreadsheets.values.update({
    spreadsheetId: sheetsConfig.sheetId(),
    range: RANGE,
    valueInputOption: "RAW",
    requestBody: { values: ROWS.map((r) => [r.key, r.get(s)]) },
  });
  cache = { value: s, at: Date.now() };
}

export async function getSettings(): Promise<Settings> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;

  try {
    await ensureTab(TAB);
    const res = await sheetsApi().spreadsheets.values.get({
      spreadsheetId: sheetsConfig.sheetId(),
      range: RANGE,
    });
    const rows = res.data.values ?? [];
    if (rows.length === 0) {
      // First run: seed the tab from env defaults.
      const seeded = defaults();
      await writeAll(seeded);
      return seeded;
    }
    const map: Record<string, string> = {};
    for (const r of rows) if (r[0]) map[String(r[0])] = r[1] ?? "";
    const value = fromMap(map);
    cache = { value, at: Date.now() };
    return value;
  } catch (err) {
    // Sheets not reachable/configured — fall back to defaults so the storefront
    // still renders. (Admin save will surface the real error.)
    console.error("getSettings fell back to defaults:", err);
    return defaults();
  }
}

export async function saveSettings(partial: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const merged: Settings = { ...current, ...partial };
  await writeAll(merged);
  return merged;
}

export function pricing(s: Settings): Pricing {
  const now = Date.now();
  const end = s.promoEndsAt ? Date.parse(s.promoEndsAt) : NaN;
  const notExpired = Number.isNaN(end) ? true : now < end;
  const promoActive = s.promoPrice > 0 && s.promoPrice < s.basePrice && notExpired;
  const price = promoActive ? s.promoPrice : s.basePrice;
  const discountPercent = promoActive
    ? Math.round((1 - s.promoPrice / s.basePrice) * 100)
    : 0;
  return { price, basePrice: s.basePrice, promoActive, promoEndsAt: s.promoEndsAt, discountPercent };
}
