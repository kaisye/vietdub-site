import SuccessClient from "./SuccessClient";

export const dynamic = "force-dynamic";

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { orderCode?: string };
}) {
  const orderCode = Number(searchParams.orderCode ?? 0);
  return (
    <div className="success-wrap">
      <SuccessClient orderCode={orderCode} />
    </div>
  );
}
