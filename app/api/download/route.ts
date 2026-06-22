import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Branded download endpoint: the buyer's browser hits /api/download on our own
// domain, and we redirect (server-side) to the real file. The GitHub URL no
// longer appears on the page / in the address bar — only the clean domain link.
export async function GET() {
  const s = await getSettings();
  if (!s.downloadUrl) {
    return NextResponse.json({ error: "Chưa cấu hình link tải." }, { status: 404 });
  }
  return NextResponse.redirect(s.downloadUrl, 302);
}
