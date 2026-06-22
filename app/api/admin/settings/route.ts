import { NextResponse } from "next/server";
import { adminPassword } from "@/lib/config";
import { getSettings, saveSettings, pricing, type Settings } from "@/lib/settings";
import { ordersSummary } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Shared-secret guard. Returns an error response if unauthorised, else null.
function guard(req: Request): NextResponse | null {
  if (!adminPassword) {
    return NextResponse.json(
      { error: "Trang quản trị chưa bật. Hãy đặt biến ADMIN_PASSWORD." },
      { status: 503 }
    );
  }
  const given = req.headers.get("x-admin-password");
  if (given !== adminPassword) {
    return NextResponse.json({ error: "Sai mật khẩu." }, { status: 401 });
  }
  return null;
}

export async function GET(req: Request) {
  const denied = guard(req);
  if (denied) return denied;
  try {
    const settings = await getSettings();
    const summary = await ordersSummary();
    return NextResponse.json({ settings, pricing: pricing(settings), summary });
  } catch (err) {
    console.error("admin GET error:", err);
    return NextResponse.json({ error: "Không đọc được dữ liệu. Kiểm tra cấu hình Google Sheet." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = guard(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as Partial<Settings>;
    const patch: Partial<Settings> = {};
    if (typeof body.productName === "string") patch.productName = body.productName.trim();
    if (body.basePrice != null) patch.basePrice = Math.max(0, Math.round(Number(body.basePrice)));
    if (body.promoPrice != null) patch.promoPrice = Math.max(0, Math.round(Number(body.promoPrice)));
    if (typeof body.promoEndsAt === "string") patch.promoEndsAt = body.promoEndsAt.trim();
    if (typeof body.downloadUrl === "string") patch.downloadUrl = body.downloadUrl.trim();
    if (typeof body.zaloGroupUrl === "string") patch.zaloGroupUrl = body.zaloGroupUrl.trim();
    if (typeof body.demoVideoUrl === "string") patch.demoVideoUrl = body.demoVideoUrl.trim();

    const settings = await saveSettings(patch);
    return NextResponse.json({ settings, pricing: pricing(settings) });
  } catch (err) {
    console.error("admin POST error:", err);
    return NextResponse.json({ error: "Không lưu được. Kiểm tra quyền ghi Google Sheet." }, { status: 500 });
  }
}
