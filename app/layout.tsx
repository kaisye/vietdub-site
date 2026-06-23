import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VietDub — Lồng tiếng & phụ đề video bằng AI, miễn phí vận hành",
  description:
    "Ứng dụng desktop dịch, lồng tiếng và render video bằng AI. Không cần API trả phí, không cần GPU — nhiều giọng Edge AI, nhân bản giọng OmniVoice, phụ đề STT/OCR khớp thời gian, chạy ngay trên máy bạn.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
