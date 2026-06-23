import { NextResponse } from "next/server";
import { adminPassword, mailConfig } from "@/lib/config";
import { sendDeliveryEmail } from "@/lib/email";
import { findOrder } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function guard(req: Request): NextResponse | null {
  if (!adminPassword) {
    return NextResponse.json({ error: "Trang quản trị chưa bật." }, { status: 503 });
  }
  const given = req.headers.get("x-admin-password");
  if (given !== adminPassword) {
    return NextResponse.json({ error: "Sai mật khẩu." }, { status: 401 });
  }
  return null;
}

// POST /api/admin/send-email
// Body: { to: string; orderCode?: number; platform?: "win"|"mac" }
//   - If orderCode is provided, look up the real order and resend.
//   - If not, send a test email to `to` with a dummy order code.
export async function POST(req: Request) {
  const denied = guard(req);
  if (denied) return denied;

  if (!mailConfig.enabled()) {
    return NextResponse.json(
      {
        error:
          "Email chưa được cấu hình. Hãy đặt SMTP_USER và SMTP_PASS trong biến môi trường Vercel rồi Redeploy.",
      },
      { status: 422 }
    );
  }

  let body: { to?: string; orderCode?: number; platform?: "win" | "mac" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Resend for a real order
  if (body.orderCode) {
    const hit = await findOrder(body.orderCode).catch(() => null);
    if (!hit) {
      return NextResponse.json({ error: `Không tìm thấy đơn #${body.orderCode}` }, { status: 404 });
    }
    try {
      await sendDeliveryEmail(hit.order.email, hit.order.orderCode, hit.order.platform);
      return NextResponse.json({ ok: true, to: hit.order.email });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  // Test email to arbitrary address
  const to = (body.to ?? "").trim();
  if (!to || !to.includes("@")) {
    return NextResponse.json({ error: "Thiếu địa chỉ email hợp lệ." }, { status: 400 });
  }
  try {
    await sendDeliveryEmail(to, 999999, body.platform ?? "win");
    return NextResponse.json({ ok: true, to });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
