import { NextResponse } from "next/server";
import { payos, newOrderCode } from "@/lib/payos";
import { appendOrder } from "@/lib/sheets";
import { siteUrl } from "@/lib/config";
import { getSettings, pricing } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();

    if (!emailRe.test(email)) {
      return NextResponse.json({ error: "Email không hợp lệ." }, { status: 400 });
    }

    const settings = await getSettings();
    const orderCode = newOrderCode();
    // Price is computed server-side from current settings (promo-aware) so the
    // amount can never be tampered with from the client.
    const amount = pricing(settings).price;

    // Record the pending order first so we never lose a buyer's contact even if
    // PayOS or the webhook hiccups.
    await appendOrder({
      orderCode,
      email,
      name,
      phone,
      amount,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      paidAt: "",
    });

    const link = await payos().createPaymentLink({
      orderCode,
      amount,
      description: `${settings.productName} #${orderCode}`.slice(0, 25), // PayOS: max 25 chars
      returnUrl: `${siteUrl}/success?orderCode=${orderCode}`,
      cancelUrl: `${siteUrl}/?cancelled=1`,
      buyerEmail: email,
      buyerName: name || undefined,
      buyerPhone: phone || undefined,
      items: [{ name: settings.productName, quantity: 1, price: amount }],
    });

    return NextResponse.json({ checkoutUrl: link.checkoutUrl, orderCode });
  } catch (err) {
    console.error("create-payment error:", err);
    return NextResponse.json(
      { error: "Không tạo được thanh toán. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
