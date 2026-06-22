"use client";

import { useState } from "react";

export interface FaqItem {
  q: string;
  a: string;
}

export default function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div>
      {items.map((it, i) => (
        <div className={`faq-item${open === i ? " open" : ""}`} key={i}>
          <button
            className="faq-q"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            {it.q}
            <span className="ch">+</span>
          </button>
          <div className="faq-a">
            <p>{it.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
