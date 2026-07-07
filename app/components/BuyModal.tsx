"use client";

import { useEffect, useState } from "react";
import { BUY_EVENT } from "./BuyButton";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Language = "vi" | "en";

const modalCopy = {
  vi: {
    invalidEmail: "Vui lòng nhập email hợp lệ để nhận link tải.",
    genericError: "Có lỗi xảy ra.",
    title: (productName: string) => `Mua ${productName}`,
    intro: "Điền email để nhận link tải + nhóm Zalo sau khi thanh toán.",
    close: "Đóng",
    email: "Email nhận phần mềm *",
    emailPlaceholder: "ban@email.com",
    name: "Tên (tuỳ chọn)",
    namePlaceholder: "Nguyễn Văn A",
    phone: "Số điện thoại / Zalo (tuỳ chọn)",
    phonePlaceholder: "09xx xxx xxx",
    platform: "Hệ điều hành của bạn *",
    platformAria: "Hệ điều hành",
    package: "Gói",
    packageValue: (platform: "win" | "mac", priceText: string) =>
      `Bản quyền trọn đời (${platform === "mac" ? "macOS" : "Windows"}) — ${priceText}`,
    loading: "Đang tạo mã thanh toán…",
    submit: "Tiếp tục thanh toán",
    note: "Quét VietQR để thanh toán. Hệ thống tự xác nhận và gửi link tải về email ngay khi nhận tiền.",
  },
  en: {
    invalidEmail: "Please enter a valid email to receive the download link.",
    genericError: "Something went wrong.",
    title: (productName: string) => `Buy ${productName}`,
    intro: "Enter your email to receive the download link and Zalo support group after payment.",
    close: "Close",
    email: "Delivery email *",
    emailPlaceholder: "you@email.com",
    name: "Name (optional)",
    namePlaceholder: "Your name",
    phone: "Phone / Zalo (optional)",
    phonePlaceholder: "+84...",
    platform: "Your operating system *",
    platformAria: "Operating system",
    package: "Package",
    packageValue: (platform: "win" | "mac", priceText: string) =>
      `Lifetime license (${platform === "mac" ? "macOS" : "Windows"}) — ${priceText}`,
    loading: "Creating payment code…",
    submit: "Continue to payment",
    note: "Scan VietQR to pay. The system confirms automatically and sends the download link to your email as soon as payment is received.",
  },
} satisfies Record<Language, {
  invalidEmail: string;
  genericError: string;
  title: (productName: string) => string;
  intro: string;
  close: string;
  email: string;
  emailPlaceholder: string;
  name: string;
  namePlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  platform: string;
  platformAria: string;
  package: string;
  packageValue: (platform: "win" | "mac", priceText: string) => string;
  loading: string;
  submit: string;
  note: string;
}>;

export default function BuyModal({
  productName,
  priceText,
  language = "vi",
}: {
  productName: string;
  priceText: string;
  language?: Language;
}) {
  const t = modalCopy[language];
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
      setError(t.invalidEmail);
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
      if (!res.ok) throw new Error(data.error || t.genericError);
      // Hand off to the PayOS hosted VietQR checkout page.
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError);
      setLoading(false);
    }
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <h3>{t.title(productName)}</h3>
            <p>{t.intro}</p>
          </div>
          <button className="x" onClick={() => setOpen(false)} aria-label={t.close}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="m-email">{t.email}</label>
              <input
                id="m-email"
                type="email"
                autoComplete="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div className="field">
              <label htmlFor="m-name">{t.name}</label>
              <input
                id="m-name"
                type="text"
                placeholder={t.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="m-phone">{t.phone}</label>
              <input
                id="m-phone"
                type="tel"
                inputMode="tel"
                placeholder={t.phonePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="field">
              <label>{t.platform}</label>
              <div className="os-seg" role="radiogroup" aria-label={t.platformAria}>
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
              <label>{t.package}</label>
              <input
                type="text"
                value={t.packageValue(platform, priceText)}
                readOnly
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? t.loading : t.submit}
            </button>
            <p className="note">{t.note}</p>
          </form>
        </div>
      </div>
    </div>
  );
}
