import { sheetsApi, ensureTab } from "./google";
import { sheetsConfig } from "./config";

// Single tab named "Orders". Columns:
// A orderCode | B email | C name | D phone | E amount | F status | G createdAt | H paidAt | I platform
const TAB = "Orders";
const RANGE = `${TAB}!A:I`;
const HEADER = ["orderCode", "email", "name", "phone", "amount", "status", "createdAt", "paidAt", "platform"];

export type OrderStatus = "PENDING" | "PAID" | "CANCELLED";
// Which installer the buyer asked for at checkout: "win" (.exe) or "mac" (.dmg).
export type OrderPlatform = "win" | "mac";

export interface Order {
  orderCode: number;
  email: string;
  name: string;
  phone: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  paidAt: string;
  platform: OrderPlatform;
}

// Make sure the tab + header row exist, so a fresh blank spreadsheet just works.
async function ensureHeader(): Promise<void> {
  await ensureTab(TAB);
  const api = sheetsApi();
  const spreadsheetId = sheetsConfig.sheetId();
  const first = await api.spreadsheets.values.get({ spreadsheetId, range: `${TAB}!A1:I1` });
  if (!first.data.values || first.data.values.length === 0) {
    await api.spreadsheets.values.update({
      spreadsheetId,
      range: `${TAB}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [HEADER] },
    });
  }
}

export async function appendOrder(order: Order): Promise<void> {
  await ensureHeader();
  await sheetsApi().spreadsheets.values.append({
    spreadsheetId: sheetsConfig.sheetId(),
    range: RANGE,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          String(order.orderCode),
          order.email,
          order.name,
          order.phone,
          String(order.amount),
          order.status,
          order.createdAt,
          order.paidAt,
          order.platform,
        ],
      ],
    },
  });
}

// Returns every order plus its 1-based sheet row index (so we can update rows).
async function readAll(): Promise<{ order: Order; row: number }[]> {
  const res = await sheetsApi().spreadsheets.values.get({
    spreadsheetId: sheetsConfig.sheetId(),
    range: RANGE,
  });
  const rows = res.data.values ?? [];
  const out: { order: Order; row: number }[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[0]) continue;
    out.push({
      row: i + 1,
      order: {
        orderCode: Number(r[0]),
        email: r[1] ?? "",
        name: r[2] ?? "",
        phone: r[3] ?? "",
        amount: Number(r[4] ?? 0),
        status: (r[5] ?? "PENDING") as OrderStatus,
        createdAt: r[6] ?? "",
        paidAt: r[7] ?? "",
        platform: r[8] === "mac" ? "mac" : "win",
      },
    });
  }
  return out;
}

export async function findOrder(orderCode: number): Promise<{ order: Order; row: number } | null> {
  const all = await readAll();
  return all.find((x) => x.order.orderCode === orderCode) ?? null;
}

export async function setStatus(
  orderCode: number,
  status: OrderStatus,
  paidAt = ""
): Promise<Order | null> {
  const hit = await findOrder(orderCode);
  if (!hit) return null;
  const updated: Order = { ...hit.order, status, paidAt: paidAt || hit.order.paidAt };
  await sheetsApi().spreadsheets.values.update({
    spreadsheetId: sheetsConfig.sheetId(),
    range: `${TAB}!F${hit.row}:H${hit.row}`,
    valueInputOption: "RAW",
    requestBody: { values: [[updated.status, updated.createdAt, updated.paidAt]] },
  });
  return updated;
}

export interface OrdersSummary {
  total: number;
  paid: number;
  pending: number;
  revenue: number;
  recent: Order[];
}

// Aggregate stats for the /admin dashboard.
export async function ordersSummary(): Promise<OrdersSummary> {
  const all = (await readAll()).map((x) => x.order);
  const paid = all.filter((o) => o.status === "PAID");
  return {
    total: all.length,
    paid: paid.length,
    pending: all.filter((o) => o.status === "PENDING").length,
    revenue: paid.reduce((sum, o) => sum + (o.amount || 0), 0),
    recent: all.slice(-8).reverse(),
  };
}
