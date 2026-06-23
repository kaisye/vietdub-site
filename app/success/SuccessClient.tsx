"use client";

import { useEffect, useState } from "react";

interface StatusResp {
  status: "PENDING" | "PAID" | "CANCELLED" | "UNKNOWN" | "ERROR";
  platform?: "win" | "mac" | null;
  downloadUrl?: string | null;
  zaloGroupUrl?: string | null;
}

export default function SuccessClient({ orderCode }: { orderCode: number }) {
  const [data, setData] = useState<StatusResp | null>(null);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (!orderCode) return;
    let active = true;

    async function poll() {
      try {
        const res = await fetch(`/api/order-status?orderCode=${orderCode}`, { cache: "no-store" });
        const json: StatusResp = await res.json();
        if (!active) return;
        setData(json);
        if (json.status !== "PAID") {
          setTries((t) => t + 1);
        }
      } catch {
        if (active) setTries((t) => t + 1);
      }
    }

    poll();
    // Webhook usually lands within seconds; poll every 3s, up to ~2 minutes.
    const id = setInterval(() => {
      if (data?.status === "PAID" || tries > 40) {
        clearInterval(id);
        return;
      }
      poll();
    }, 3000);

    return () => {
      active = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderCode, data?.status]);

  if (!orderCode) {
    return (
      <div className="success-card">
        <div className="emoji">🤔</div>
        <h1>Thiếu mã đơn hàng</h1>
        <p>Không tìm thấy thông tin đơn hàng. Vui lòng quay lại trang chủ và thử lại.</p>
        <div className="actions">
          <a className="secondary" href="/">Về trang chủ</a>
        </div>
      </div>
    );
  }

  const paid = data?.status === "PAID";

  if (paid) {
    return (
      <div className="success-card">
        <div className="emoji">🎉</div>
        <h1>Thanh toán thành công!</h1>
        <p>Cảm ơn bạn. Đơn hàng <b>#{orderCode}</b> đã được xác nhận. Tải phần mềm và tham gia nhóm hỗ trợ bên dưới — link cũng đã được gửi vào email của bạn.</p>
        <div className="actions">
          {data?.downloadUrl && (
            <a className="primary" href={data.downloadUrl}>
              ⬇️ Tải VietDub {data.platform === "mac" ? "cho macOS (.dmg)" : "cho Windows (.exe)"}
            </a>
          )}
          {data?.zaloGroupUrl && (
            <a className="secondary" href={data.zaloGroupUrl} target="_blank" rel="noreferrer">
              💬 Vào nhóm Zalo hỗ trợ
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="success-card">
      <div className="emoji">⏳</div>
      <h1>Đang xác nhận thanh toán…</h1>
      <p>
        Đơn hàng <b>#{orderCode}</b>. Nếu bạn vừa chuyển khoản, hệ thống sẽ tự xác nhận trong
        vài giây. Trang này sẽ tự cập nhật.
      </p>
      <div className="spinner" />
      {tries > 30 && (
        <p style={{ marginTop: 18, fontSize: 13 }}>
          Chưa nhận được xác nhận? Kiểm tra lại nội dung chuyển khoản hoặc liên hệ hỗ trợ —
          link tải cũng sẽ được gửi qua email ngay khi thanh toán được ghi nhận.
        </p>
      )}
    </div>
  );
}
