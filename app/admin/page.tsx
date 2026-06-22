import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "VietDub — Quản trị" };

export default function AdminPage() {
  return (
    <div className="admin-wrap">
      <AdminClient />
    </div>
  );
}
