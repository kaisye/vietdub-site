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
    return NextResponse.json({ error: explainSheetsError(err) }, { status: 500 });
  }
}

// Turn raw Google/OpenSSL errors into an actionable Vietnamese message.
function explainSheetsError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/DECODER|ERR_OSSL|PEM|asn1|bad base64/i.test(msg)) {
    return "GOOGLE_PRIVATE_KEY sai định dạng. Dán nguyên private_key từ file JSON (một dòng, trong dấu nháy kép, giữ các \\n).";
  }
  if (/permission|PERMISSION_DENIED|forbidden|403/i.test(msg)) {
    return "Chưa có quyền truy cập Sheet. Hãy chia sẻ Google Sheet cho email service account (quyền Editor).";
  }
  if (/not found|404|Requested entity/i.test(msg)) {
    return "Không tìm thấy Sheet HOẶC chưa chia sẻ. Hãy: (1) chia sẻ đúng Sheet đó cho email service account với quyền Editor; (2) kiểm tra GOOGLE_SHEET_ID khớp Sheet bạn muốn dùng (chỉ cần ID).";
  }
  if (/Unable to parse range/i.test(msg)) {
    return "Lỗi đọc vùng dữ liệu Sheet. Thử lại sau khi đã chia sẻ quyền Editor cho service account.";
  }
  // Our own validation messages are already user-friendly — pass them through.
  if (/GOOGLE_|service account|private_key/i.test(msg)) return msg;
  return "Không đọc được dữ liệu. Kiểm tra cấu hình Google Sheet (ID, service account, đã chia sẻ quyền Editor).";
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
    if (typeof body.downloadUrlMac === "string") patch.downloadUrlMac = body.downloadUrlMac.trim();
    if (typeof body.zaloGroupUrl === "string") patch.zaloGroupUrl = body.zaloGroupUrl.trim();
    if (typeof body.demoVideoUrl === "string") patch.demoVideoUrl = body.demoVideoUrl.trim();
    if (typeof body.facebookUrl === "string") patch.facebookUrl = body.facebookUrl.trim();
    if (typeof body.tutorialVideoUrl === "string") patch.tutorialVideoUrl = body.tutorialVideoUrl.trim();
    if (typeof body.maintenance === "boolean") patch.maintenance = body.maintenance;
    if (typeof body.maintenanceMessage === "string") patch.maintenanceMessage = body.maintenanceMessage.trim();

    const settings = await saveSettings(patch);
    return NextResponse.json({ settings, pricing: pricing(settings) });
  } catch (err) {
    console.error("admin POST error:", err);
    return NextResponse.json({ error: explainSheetsError(err) }, { status: 500 });
  }
}
