"use client";

import { useState } from "react";

export default function BuyForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra.");
      // Redirect to the PayOS hosted VietQR checkout page.
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleBuy}>
      <div className="field">
        <label htmlFor="email">Email nhận phần mềm *</label>
        <input
          id="email"
          type="email"
          required
          placeholder="ban@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="name">Tên (tuỳ chọn)</label>
        <input
          id="name"
          type="text"
          placeholder="Nguyễn Văn A"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {error && <div className="error">{error}</div>}

      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Đang tạo mã thanh toán…" : "Mua & nhận link tải ngay"}
      </button>

      <p className="note">
        Quét VietQR để thanh toán. Hệ thống tự xác nhận và gửi link tải + nhóm Zalo
        về email của bạn ngay sau khi nhận tiền.
      </p>
    </form>
  );
}
