import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VietDub — Lồng tiếng & phụ đề video bằng AI",
  description:
    "Phần mềm lồng tiếng, dịch và tạo phụ đề video tự động bằng AI. Cài đặt trên Windows, dùng ngay.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
