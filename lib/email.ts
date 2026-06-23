import nodemailer from "nodemailer";
import { mailConfig, siteUrl } from "./config";
import { getSettings } from "./settings";

// Gmail SMTP via app password — free, no domain needed, sends to anyone.
// If SMTP_USER/SMTP_PASS are not set the whole step is skipped silently so a
// missing mail config never blocks a purchase.
function transport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: mailConfig.user, pass: mailConfig.pass },
  });
}

export async function sendDeliveryEmail(
  to: string,
  orderCode: number,
  platform: "win" | "mac" = "win"
): Promise<void> {
  if (!mailConfig.enabled()) return;

  const s = await getSettings();
  // Branded download links (hide the underlying GitHub URL from buyers). The
  // buyer's chosen OS is primary; the other OS is offered as a secondary link
  // since the licence works on both.
  const isMac = platform === "mac";
  const primaryOs = isMac ? "mac" : "win";
  const otherOs = isMac ? "win" : "mac";
  const primaryLabel = isMac ? "macOS (.dmg)" : "Windows (.exe)";
  const otherLabel = isMac ? "Windows (.exe)" : "macOS (.dmg)";
  const dl = `${siteUrl}/api/download?os=${primaryOs}`;
  const dlOther = `${siteUrl}/api/download?os=${otherOs}`;
  const zaloLine = s.zaloGroupUrl
    ? `<p>Tham gia nhóm Zalo hỗ trợ: <a href="${s.zaloGroupUrl}">${s.zaloGroupUrl}</a></p>`
    : "";

  const zaloText = s.zaloGroupUrl ? `\nTham gia nhóm Zalo hỗ trợ: ${s.zaloGroupUrl}` : "";
  const tutorialText = s.tutorialVideoUrl
    ? `\nVideo hướng dẫn cài đặt & sử dụng: ${s.tutorialVideoUrl}`
    : "";

  const text = `Cảm ơn bạn đã mua ${s.productName}!

Đơn hàng #${orderCode} đã thanh toán thành công.

Tải ${s.productName} cho ${primaryLabel}:
${dl}

Dùng máy khác? Tải bản ${otherLabel}:
${dlOther}
(Bản quyền dùng được cho cả hai nền tảng.)
${tutorialText}${zaloText}

Nếu link không mở được, copy đường dẫn trên vào trình duyệt.
Nếu không thấy email này, hãy kiểm tra thư mục Spam.
`;

  const tutorialHtml = s.tutorialVideoUrl
    ? `
    <div style="background:#f0f7ff;border-left:4px solid #4f46e5;padding:14px 16px;border-radius:0 8px 8px 0;margin:20px 0">
      <p style="margin:0 0 6px;font-weight:600;font-size:14px;color:#1f2933">📹 Video hướng dẫn cài đặt & sử dụng</p>
      <a href="${s.tutorialVideoUrl}" style="color:#4f46e5;font-size:13px;word-break:break-all">${s.tutorialVideoUrl}</a>
    </div>`
    : "";

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#1f2933;padding:24px">
    <h2 style="color:#4f46e5;margin-bottom:12px">Cảm ơn bạn đã mua ${s.productName}!</h2>
    <p style="margin-bottom:16px">Đơn hàng <b>#${orderCode}</b> đã thanh toán thành công. Dưới đây là phần mềm của bạn (bản ${primaryLabel}):</p>
    <p style="margin:24px 0">
      <a href="${dl}"
         style="background:#4f46e5;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
        Tải ${s.productName} cho ${primaryLabel}
      </a>
    </p>
    <p style="font-size:13px;color:#6b7280;margin-bottom:8px">Dùng máy khác? Tải bản <a href="${dlOther}" style="color:#4f46e5">${otherLabel}</a> — bản quyền dùng được cho cả hai.</p>
    ${tutorialHtml}
    ${s.zaloGroupUrl ? `<p style="margin-top:16px">Tham gia nhóm Zalo hỗ trợ: <a href="${s.zaloGroupUrl}" style="color:#4f46e5">${s.zaloGroupUrl}</a></p>` : ""}
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
    <p style="font-size:12px;color:#9ca3af">
      Nếu nút trên không bấm được, copy link sau vào trình duyệt:<br/>
      <span style="word-break:break-all;color:#6b7280">${dl}</span>
    </p>
  </div>`;

  await transport().sendMail({
    from: `"${mailConfig.fromName}" <${mailConfig.user}>`,
    to,
    replyTo: mailConfig.user,
    subject: `[${s.productName}] Link tải phần mềm — Đơn #${orderCode}`,
    text,
    html,
  });
}
