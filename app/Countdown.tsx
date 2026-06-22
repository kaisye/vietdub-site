"use client";

import { useEffect, useState } from "react";

function diff(endsAt: string) {
  const ms = Date.parse(endsAt) - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function Countdown({ endsAt }: { endsAt: string }) {
  const [t, setT] = useState<ReturnType<typeof diff>>(null);

  useEffect(() => {
    setT(diff(endsAt));
    const id = setInterval(() => setT(diff(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!t) return null;

  return (
    <span className="countdown">
      Kết thúc sau {t.d > 0 && `${t.d} ngày `}
      {pad(t.h)}:{pad(t.m)}:{pad(t.s)}
    </span>
  );
}
