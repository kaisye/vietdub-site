"use client";

import { useState } from "react";

interface Settings {
  productName: string;
  basePrice: number;
  promoPrice: number;
  promoEndsAt: string;
  downloadUrl: string;
  zaloGroupUrl: string;
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
          <button className="btn" disabled={loading}>
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
              <label>Link tải (.exe)</label>
              <input value={settings.downloadUrl} onChange={(e) => set("downloadUrl", e.target.value)} />
            </div>
            <div className="field full">
              <label>Link nhóm Zalo</label>
              <input value={settings.zaloGroupUrl} onChange={(e) => set("zaloGroupUrl", e.target.value)} />
            </div>
          </div>

          {error && <div className="error">{error}</div>}
          {saved && <div className="ok-msg">✅ Đã lưu. Khách sẽ thấy thay đổi trong ~30 giây.</div>}

          <button className="btn" disabled={loading}>
            {loading ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
        </form>
      )}

      {summary && summary.recent.length > 0 && (
        <table className="table">
          <thead>
            <tr><th>Mã đơn</th><th>Email</th><th>Số tiền</th><th>Trạng thái</th></tr>
          </thead>
          <tbody>
            {summary.recent.map((o) => (
              <tr key={o.orderCode}>
                <td>#{o.orderCode}</td>
                <td>{o.email}</td>
                <td>{vnd(o.amount)}</td>
                <td><span className={`pill ${o.status}`}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
