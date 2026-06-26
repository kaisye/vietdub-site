"use client";

import { useState } from "react";

interface Settings {
  productName: string;
  basePrice: number;
  promoPrice: number;
  promoEndsAt: string;
  downloadUrl: string;
  downloadUrlMac: string;
  zaloGroupUrl: string;
  demoVideoUrl: string;
  facebookUrl: string;
  tutorialVideoUrl: string;
  maintenance: boolean;
  maintenanceMessage: string;
}
interface Pricing {
  price: number;
  basePrice: number;
  promoActive: boolean;
  discountPercent: number;
  promoEndsAt: string;
}
interface Order {
  orderCode: number;
  email: string;
  amount: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  createdAt: string;
}
interface Summary {
  total: number;
  paid: number;
  pending: number;
  revenue: number;
  recent: Order[];
}

const vnd = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "₫";

// ISO <-> <input type="datetime-local"> (which uses local time, no timezone).
function isoToLocal(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}
function localToIso(local: string): string {
  if (!local) return "";
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

export default function AdminClient() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState<Settings | null>(null);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  const [testEmail, setTestEmail] = useState("");
  const [testPlatform, setTestPlatform] = useState<"win" | "mac">("win");
  const [emailStatus, setEmailStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [sendingEmail, setSendingEmail] = useState<number | "test" | null>(null);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", { headers: { "x-admin-password": pw } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đăng nhập thất bại.");
      setSettings(data.settings);
      setPricing(data.pricing);
      setSummary(data.summary);
      setAuthed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi.");
    } finally {
      setLoading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setError("");
    setSaved(false);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": pw },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lưu thất bại.");
      setSettings(data.settings);
      setPricing(data.pricing);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi.");
    } finally {
      setLoading(false);
    }
  }

  async function sendEmail(opts: { to?: string; orderCode?: number; platform?: "win" | "mac" }) {
    const key = opts.orderCode ?? "test";
    setSendingEmail(key);
    setEmailStatus(null);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": pw },
        body: JSON.stringify(opts),
      });
      const data = await res.json();
      if (!res.ok) setEmailStatus({ ok: false, msg: data.error || "Gửi thất bại." });
      else setEmailStatus({ ok: true, msg: `Đã gửi tới ${data.to}` });
    } catch (err) {
      setEmailStatus({ ok: false, msg: err instanceof Error ? err.message : "Lỗi mạng." });
    } finally {
      setSendingEmail(null);
    }
  }

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((s) => (s ? { ...s, [key]: value } : s));
    setSaved(false);
  }

  if (!authed) {
    return (
      <div className="admin-card" style={{ maxWidth: 380 }}>
        <h1>Quản trị VietDub</h1>
        <p className="hint">Nhập mật khẩu để chỉnh giá & nội dung.</p>
        <form onSubmit={login}>
          <div className="field">
            <label htmlFor="pw">Mật khẩu</label>
            <input
              id="pw"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoFocus
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Đang kiểm tra…" : "Đăng nhập"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <h1>Quản trị VietDub</h1>
      <p className="hint">
        Sửa giá, khuyến mãi, link tải… rồi bấm <b>Lưu</b>. Thay đổi áp dụng cho khách trong
        ~30 giây, không cần deploy lại.
      </p>

      {summary && (
        <div className="stats">
          <div className="stat"><b>{summary.total}</b><span>Tổng đơn</span></div>
          <div className="stat"><b>{summary.paid}</b><span>Đã thanh toán</span></div>
          <div className="stat"><b>{summary.pending}</b><span>Chờ thanh toán</span></div>
          <div className="stat"><b>{vnd(summary.revenue)}</b><span>Doanh thu</span></div>
        </div>
      )}

      {pricing && (
        <p className="hint">
          Giá hiện áp dụng cho khách: <b>{vnd(pricing.price)}</b>
          {pricing.promoActive ? ` (đang giảm ${pricing.discountPercent}% từ ${vnd(pricing.basePrice)})` : " (không khuyến mãi)"}
        </p>
      )}

      {settings && (
        <form onSubmit={save}>
          {/* ── Maintenance mode ─────────────────────────── */}
          <div
            style={{
              marginBottom: 18,
              padding: 16,
              borderRadius: 12,
              border: `1px solid ${settings.maintenance ? "#e0a800" : "#e2e2e2"}`,
              background: settings.maintenance ? "#fff8e6" : "#fafafa",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={settings.maintenance}
                onChange={(e) => set("maintenance", e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              🛠️ Chế độ bảo trì
              <span style={{ fontWeight: 400, fontSize: 13, color: settings.maintenance ? "#a86b00" : "#888" }}>
                {settings.maintenance ? "ĐANG BẬT — khách thấy trang bảo trì, tạm dừng nhận đơn" : "đang tắt"}
              </span>
            </label>
            <p className="hint" style={{ margin: "8px 0 0" }}>
              Khi bật: trang chủ hiện thông báo bảo trì và <b>chặn mua mới</b>. Trang tải, trang cảm ơn
              và /admin vẫn hoạt động bình thường. Áp dụng trong ~30 giây sau khi lưu.
            </p>
            <div className="field full" style={{ marginTop: 12, marginBottom: 0 }}>
              <label>Thông báo bảo trì (để trống = dùng câu mặc định)</label>
              <textarea
                rows={2}
                placeholder="Chúng tôi đang nâng cấp hệ thống, vui lòng quay lại sau ít phút…"
                value={settings.maintenanceMessage}
                onChange={(e) => set("maintenanceMessage", e.target.value)}
              />
            </div>
          </div>

          <div className="admin-grid">
            <div className="field full">
              <label>Tên sản phẩm</label>
              <input value={settings.productName} onChange={(e) => set("productName", e.target.value)} />
            </div>
            <div className="field">
              <label>Giá gốc (VND)</label>
              <input type="number" min={0} value={settings.basePrice} onChange={(e) => set("basePrice", Number(e.target.value))} />
            </div>
            <div className="field">
              <label>Giá khuyến mãi (VND)</label>
              <input type="number" min={0} value={settings.promoPrice} onChange={(e) => set("promoPrice", Number(e.target.value))} />
            </div>
            <div className="field full">
              <label>Khuyến mãi kết thúc lúc (để trống = không giảm giá theo thời hạn)</label>
              <input
                type="datetime-local"
                value={isoToLocal(settings.promoEndsAt)}
                onChange={(e) => set("promoEndsAt", localToIso(e.target.value))}
              />
            </div>
            <div className="field full">
              <label>Link tải Windows (.exe)</label>
              <input value={settings.downloadUrl} onChange={(e) => set("downloadUrl", e.target.value)} />
            </div>
            <div className="field full">
              <label>Link tải macOS (.dmg)</label>
              <input value={settings.downloadUrlMac} onChange={(e) => set("downloadUrlMac", e.target.value)} />
            </div>
            <div className="field full">
              <label>Link nhóm Zalo</label>
              <input value={settings.zaloGroupUrl} onChange={(e) => set("zaloGroupUrl", e.target.value)} />
            </div>
            <div className="field full">
              <label>Link video demo (YouTube hoặc .mp4 — để trống sẽ ẩn mục demo)</label>
              <input
                placeholder="https://youtu.be/..."
                value={settings.demoVideoUrl}
                onChange={(e) => set("demoVideoUrl", e.target.value)}
              />
            </div>
            <div className="field full">
              <label>Link Facebook (trang demo video lồng tiếng — để trống sẽ ẩn link)</label>
              <input
                placeholder="https://facebook.com/..."
                value={settings.facebookUrl}
                onChange={(e) => set("facebookUrl", e.target.value)}
              />
            </div>
            <div className="field full">
              <label>Link video hướng dẫn cài đặt (YouTube private — gửi kèm email & hiện trên trang cảm ơn)</label>
              <input
                placeholder="https://youtu.be/..."
                value={settings.tutorialVideoUrl}
                onChange={(e) => set("tutorialVideoUrl", e.target.value)}
              />
            </div>
          </div>

          {error && <div className="error">{error}</div>}
          {saved && <div className="ok-msg">✅ Đã lưu. Khách sẽ thấy thay đổi trong ~30 giây.</div>}

          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
        </form>
      )}

      {/* ── Test email ─────────────────────────────────── */}
      {authed && (
        <div className="admin-section" style={{ marginTop: 28 }}>
          <h3 style={{ marginBottom: 8, fontSize: 15 }}>Kiểm tra gửi email</h3>
          <p className="hint" style={{ marginBottom: 12 }}>
            Gửi thử email link tải về địa chỉ bất kỳ (không cần mua thật). Dùng để xác nhận cấu hình SMTP hoạt động.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div className="field" style={{ flex: "1 1 220px", marginBottom: 0 }}>
              <label>Email nhận</label>
              <input
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <div className="field" style={{ minWidth: 120, marginBottom: 0 }}>
              <label>Nền tảng</label>
              <select
                value={testPlatform}
                onChange={(e) => setTestPlatform(e.target.value as "win" | "mac")}
              >
                <option value="win">Windows</option>
                <option value="mac">macOS</option>
              </select>
            </div>
            <button
              className="btn btn-primary"
              disabled={sendingEmail === "test" || !testEmail}
              onClick={() => sendEmail({ to: testEmail, platform: testPlatform })}
              style={{ marginBottom: 0 }}
            >
              {sendingEmail === "test" ? "Đang gửi…" : "Gửi thử"}
            </button>
          </div>
          {emailStatus && (
            <div className={emailStatus.ok ? "ok-msg" : "error"} style={{ marginTop: 8 }}>
              {emailStatus.ok ? "✅ " : "❌ "}{emailStatus.msg}
            </div>
          )}
        </div>
      )}

      {summary && summary.recent.length > 0 && (
        <table className="table" style={{ marginTop: 24 }}>
          <thead>
            <tr><th>Mã đơn</th><th>Email</th><th>Số tiền</th><th>Trạng thái</th><th></th></tr>
          </thead>
          <tbody>
            {summary.recent.map((o) => (
              <tr key={o.orderCode}>
                <td>#{o.orderCode}</td>
                <td>{o.email}</td>
                <td>{vnd(o.amount)}</td>
                <td><span className={`pill ${o.status}`}>{o.status}</span></td>
                <td>
                  {o.status === "PAID" && (
                    <button
                      className="btn btn-sm"
                      disabled={sendingEmail === o.orderCode}
                      onClick={() => sendEmail({ orderCode: o.orderCode })}
                      title="Gửi lại email link tải"
                    >
                      {sendingEmail === o.orderCode ? "…" : "Gửi lại"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
