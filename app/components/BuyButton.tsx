"use client";

// A thin client button that opens the shared buy modal via a window event, so
// server-rendered sections can sprinkle "buy" CTAs without each owning a modal.
export const BUY_EVENT = "vietdub:buy";

export default function BuyButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent(BUY_EVENT))}
    >
      {children}
    </button>
  );
}
