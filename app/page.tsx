import { getSettings, pricing } from "@/lib/settings";
import BuyForm from "./BuyForm";
import Countdown from "./Countdown";

export const dynamic = "force-dynamic";

const features = [
  { ico: "🎙️", title: "Lồng tiếng AI tự nhiên", desc: "Giọng đọc tiếng Việt mượt mà, hỗ trợ nhân bản giọng từ mẫu của bạn." },
  { ico: "🌐", title: "Dịch & phụ đề tự động", desc: "Tự nhận dạng lời thoại, dịch và tạo phụ đề khớp thời gian." },
  { ico: "🖥️", title: "Chạy trên máy của bạn", desc: "Cài đặt một lần trên Windows, không cần cấu hình phức tạp." },
  { ico: "🔄", title: "Tự động cập nhật", desc: "App tự kiểm tra và cài bản mới đã ký an toàn — không phải tải lại tay." },
];

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "₫";
}

export default async function Home() {
  const settings = await getSettings();
  const p = pricing(settings);

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge">★ Phần mềm lồng tiếng & phụ đề bằng AI</span>
          <h1>Biến mọi video thành tiếng Việt — chỉ trong vài phút.</h1>
          <p className="sub">
            {settings.productName} tự động nhận dạng, dịch, lồng tiếng và tạo phụ đề cho video của bạn.
            Thanh toán một lần, nhận link tải ngay.
          </p>

          <div className="grid">
            <ul className="features">
              {features.map((f) => (
                <li className="feature" key={f.title}>
                  <span className="ico">{f.ico}</span>
                  <div>
                    <b>{f.title}</b>
                    <span>{f.desc}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="card">
              {p.promoActive && (
                <div className="promo-banner">
                  🔥 Ưu đãi ra mắt −{p.discountPercent}%
                  {p.promoEndsAt && <Countdown endsAt={p.promoEndsAt} />}
                </div>
              )}

              <div className="price">
                <span className="amount">{formatVnd(p.price)}</span>
                {p.promoActive && <span className="strike">{formatVnd(p.basePrice)}</span>}
                <span className="once">Trả 1 lần</span>
              </div>

              <BuyForm />

              <div className="pay-logos">
                <span>VietQR</span>
                <span>Chuyển khoản ngân hàng</span>
                <span>Xác nhận tự động</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} {settings.productName}. Thanh toán an toàn qua PayOS · VietQR.
      </footer>
    </>
  );
}
