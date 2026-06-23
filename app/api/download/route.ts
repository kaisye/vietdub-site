import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Branded download endpoint: the buyer's browser hits /api/download on our own
// domain, and we redirect (server-side) to the real file. The GitHub URL no
// longer appears on the page / in the address bar — only the clean domain link.
// ?os=mac serves the macOS .dmg; anything else (incl. no param) serves Windows.
export async function GET(req: Request) {
  const os = new URL(req.url).searchParams.get("os");
  const s = await getSettings();
  const url = os === "mac" ? s.downloadUrlMac : s.downloadUrl;
  if (!url) {
    return NextResponse.json({ error: "Chưa cấu hình link tải." }, { status: 404 });
  }
  return NextResponse.redirect(url, 302);
}
