"use client";

import { useEffect, useState } from "react";
import { BUY_EVENT } from "./BuyButton";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BuyModal({
  productName,
  priceText,
}: {
  productName: string;
  priceText: string;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [platform, setPlatform] = useState<"win" | "mac">("win");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onOpen = () => {
      setError("");
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener(BUY_EVENT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(BUY_EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailRe.test(email)) {
      setError("Vui lòng nhập email hợp lệ để nhận link tải.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, phone, platform }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra.");
      // Hand off to the PayOS hosted VietQR checkout page.
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
      setLoading(false);
    }
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <h3>Mua {productName}</h3>
            <p>Điền email để nhận link tải + nhóm Zalo sau khi thanh toán.</p>
          </div>
          <button className="x" onClick={() => setOpen(false)} aria-label="Đóng">✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="m-email">Email nhận phần mềm *</label>
              <input
                id="m-email"
                type="email"
                autoComplete="email"
                placeholder="ban@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div className="field">
              <label htmlFor="m-name">Tên (tuỳ chọn)</label>
              <input
                id="m-name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="m-phone">Số điện thoại / Zalo (tuỳ chọn)</label>
              <input
                id="m-phone"
                type="tel"
                inputMode="tel"
                placeholder="09xx xxx xxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Hệ điều hành của bạn *</label>
              <div className="os-seg" role="radiogroup" aria-label="Hệ điều hành">
                <button
                  type="button"
                  role="radio"
                  aria-checked={platform === "win"}
                  className={platform === "win" ? "active" : ""}
                  onClick={() => setPlatform("win")}
                >
                  <span className="os-ico">🪟</span>
                  <span>Windows</span>
                  <small>.exe</small>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={platform === "mac"}
                  className={platform === "mac" ? "active" : ""}
                  onClick={() => setPlatform("mac")}
                >
                  <span className="os-ico"></span>
                  <span>macOS</span>
                  <small>.dmg · Apple Silicon</small>
                </button>
              </div>
            </div>
            <div className="field">
              <label>Gói</label>
              <input
                type="text"
                value={`Bản quyền trọn đời (${platform === "mac" ? "macOS" : "Windows"}) — ${priceText}`}
                readOnly
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? "Đang tạo mã thanh toán…" : "Tiếp tục thanh toán"}
            </button>
            <p className="note">
              Quét VietQR để thanh toán. Hệ thống tự xác nhận và gửi link tải về email ngay
              khi nhận tiền.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
