import { NextResponse } from "next/server";
import { payos } from "@/lib/payos";
import { findOrder, setStatus } from "@/lib/sheets";
import { sendDeliveryEmail } from "@/lib/email";
import { webhookToken } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Optional shared-secret in the URL (?token=...) to reject random POSTs.
  if (webhookToken) {
    const token = new URL(req.url).searchParams.get("token");
    if (token !== webhookToken) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  // Verify the PayOS signature — throws if the payload was tampered with.
  let data: { orderCode: number; amount: number };
  try {
    data = payos().verifyPaymentWebhookData(body as never) as never;
  } catch {
    // PayOS sends a test ping when you register the URL; accept it so the
    // dashboard marks the webhook as valid.
    return NextResponse.json({ success: true });
  }

  try {
    const orderCode = Number(data.orderCode);
    const hit = await findOrder(orderCode);
    if (!hit) {
      // Unknown order (e.g. test ping with a sample code) — acknowledge anyway.
      return NextResponse.json({ success: true });
    }

    // Idempotent: only act the first time it flips to PAID.
    if (hit.order.status !== "PAID") {
      await setStatus(orderCode, "PAID", new Date().toISOString());
      await sendDeliveryEmail(hit.order.email, orderCode).catch((e) =>
        console.error("delivery email failed:", e)
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("webhook processing error:", err);
    // Return 200 so PayOS does not retry-storm; we already logged it.
    return NextResponse.json({ success: true });
  }
}
