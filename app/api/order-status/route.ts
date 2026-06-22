import { NextResponse } from "next/server";
import { findOrder } from "@/lib/sheets";
import { getSettings } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The success page polls this to know when the webhook has flipped the order to
// PAID, then it reveals the download + Zalo links inline.
export async function GET(req: Request) {
  const orderCode = Number(new URL(req.url).searchParams.get("orderCode"));
  if (!orderCode) {
    return NextResponse.json({ error: "missing orderCode" }, { status: 400 });
  }

  try {
    const hit = await findOrder(orderCode);
    if (!hit) {
      return NextResponse.json({ status: "UNKNOWN" });
    }
    const paid = hit.order.status === "PAID";
    const settings = paid ? await getSettings() : null;
    return NextResponse.json({
      status: hit.order.status,
      // Only hand out delivery links once payment is confirmed.
      downloadUrl: settings?.downloadUrl ?? null,
      zaloGroupUrl: settings?.zaloGroupUrl || null,
    });
  } catch (err) {
    console.error("order-status error:", err);
    return NextResponse.json({ status: "ERROR" }, { status: 500 });
  }
}
