import { getSettings, pricing } from "@/lib/settings";
import Countdown from "./Countdown";
import BuyButton from "./components/BuyButton";
import BuyModal from "./components/BuyModal";
import Faq, { type FaqItem } from "./components/Faq";

export const dynamic = "force-dynamic";

function vnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "₫";
}

// Normalise a YouTube link to an embeddable URL; otherwise treat as a video file.
function toEmbed(url: string): { kind: "youtube" | "video" | "none"; src: string } {
  if (!url) return { kind: "none", src: "" };
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: "youtube", src: `https://www.youtube.com/embed/${yt[1]}` };
  return { kind: "video", src: url };
}

const features = [
  { b: "b-sky", ico: "🌐", h: "Dịch & phụ đề tự động", p: "Nhận dạng lời thoại (Groq / NVIDIA hoặc phụ đề có sẵn), dịch qua 9router và tạo phụ đề khớp thời gian." },
  { b: "b-peach", ico: "🎙️", h: "Lồng tiếng AI, nhiều giọng", p: "Edge TTS dùng ngay, VieNeu tiếng Việt, hoặc OmniVoice nhân bản giọng từ chính mẫu giọng của bạn." },
  { b: "b-mint", ico: "⏱️", h: "Khớp tốc độ & nhịp thoại", p: "Tự chỉnh tốc độ đọc cho khít timing gốc, giữ lời thoại tự nhiên và đúng nhịp video." },
  { b: "b-lilac", ico: "🎵", h: "Nhạc nền & tách giọng", p: "Giữ nhạc nền, thêm hiệu ứng âm thanh; chế độ hybrid tách giọng gốc khi cần." },
  { b: "b-teal", ico: "🔒", h: "Chạy cục bộ, riêng tư", p: "Backend chỉ chạy trên 127.0.0.1, video và cấu hình nằm trên máy bạn. Không cần quyền admin." },
  { b: "b-sand", ico: "🔄", h: "Render & tự cập nhật", p: "Xuất video hoàn chỉnh với FFmpeg tích hợp; app tự kiểm tra và cài bản mới đã ký an toàn." },
];

const faqItems: FaqItem[] = [
  { q: "Mua một lần thì dùng được bao lâu?", a: "Vĩnh viễn. Sau khi thanh toán bạn nhận link tải về email và dùng được mãi trên máy của mình, kèm các bản cập nhật miễn phí." },
  { q: "Tôi nhận phần mềm bằng cách nào?", a: "Sau khi quét VietQR và chuyển khoản, hệ thống tự xác nhận trong vài giây, gửi link tải + link nhóm Zalo về email và hiện ngay trên trang cảm ơn." },
  { q: "Chạy được trên hệ điều hành nào?", a: "Windows 10/11 (x64) và macOS chip Apple Silicon (M1 trở lên). Windows ARM chạy qua giả lập x64. Trình cài đặt tự lo môi trường cần thiết." },
  { q: "Cần chuẩn bị gì để dùng?", a: "Giọng Edge TTS dùng được ngay không cần GPU. Phần dịch cần 9router (app tự tải, không cần quyền admin) hoặc API key Groq/NVIDIA cho nhận dạng. VieNeu/OmniVoice tải thêm khi dùng." },
  { q: "Dữ liệu của tôi có an toàn không?", a: "Có. App chạy cục bộ, backend chỉ bind 127.0.0.1, video và cấu hình không gửi lên máy chủ của chúng tôi. Bạn toàn quyền kiểm soát." },
];

export default async function Home() {
  const settings = await getSettings();
  const p = pricing(settings);
  const demo = toEmbed(settings.demoVideoUrl);
  const priceText = vnd(p.price);
  const name = settings.productName;
  const zalo = settings.zaloGroupUrl || "#";

  const Logo = (
    <span className="logo" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M4 9v6M8 5v14M12 8v8M16 4v16M20 10v4" />
      </svg>
    </span>
  );

  return (
    <>
      <div className="topband" />

      <header>
        <div className="wrap">
          <nav>
            <a className="brand" href="#top">{Logo}{name}</a>
            <div className="navlinks">
              <a href="#features" className="hide-sm">Tính năng</a>
              <a href="#demo" className="hide-sm">Demo</a>
              <a href="#pricing" className="hide-sm">Báo giá</a>
              <a href="#support" className="hide-sm">Hỗ trợ</a>
              <BuyButton className="nav-cta">Mua ngay</BuyButton>
            </div>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <div className="wrap" id="top">
        <section className="hero">
          <div>
            <span className="pill"><span className="dot" /> Đã phát hành · Windows &amp; macOS</span>
            <h1>Lồng tiếng &amp; phụ đề video,<br /><span className="hl">để AI lo.</span></h1>
            <p className="lead">
              {name} dịch, lồng tiếng và render video ngay trên máy bạn — nhiều giọng đọc, nhân
              bản giọng từ mẫu, phụ đề khớp thời gian. Trả một lần, dùng mãi mãi.
            </p>
            <div className="cta-row">
              <BuyButton className="btn btn-primary">Mua bản quyền — {priceText}</BuyButton>
              <a className="btn" href="#demo">Xem demo</a>
            </div>
            <div className="ticks">
              <span><span className="ck">✓</span> Trả một lần, dùng vĩnh viễn</span>
              <span><span className="ck">✓</span> Tự động cập nhật</span>
              <span><span className="ck">✓</span> Chạy cục bộ, riêng tư</span>
            </div>
          </div>

          <div>
            <div className="stage">
              <span className="floaty f1">Nhân bản giọng ✦</span>
              <span className="floaty f2">Chạy cục bộ ⚡</span>
              <span className="floaty f3">Phụ đề khớp ⏱</span>
              <div className="app-window">
                <div className="app-bar"><i /><i /><i /><span className="ttl">{name} — Tiến trình dự án</span></div>
                <div className="app-body">
                  <div className="task-row">
                    <span className="ic b-sky">📥</span>
                    <div className="tx"><b>Tải &amp; nhận dạng lời thoại</b><small>video.mp4 · 12:48</small></div>
                    <span className="st done">Xong</span>
                  </div>
                  <div className="task-row">
                    <span className="ic b-mint">🌐</span>
                    <div className="tx"><b>Dịch phụ đề (9router)</b><small>EN → VI · 320 dòng</small></div>
                    <span className="st done">Xong</span>
                  </div>
                  <div className="task-row">
                    <span className="ic b-peach">🎙️</span>
                    <div className="tx"><b>Lồng tiếng AI · nhân bản giọng</b><small>Đang tổng hợp…</small></div>
                    <span className="st run">Đang chạy</span>
                  </div>
                  <div className="task-row">
                    <span className="ic b-lilac">🎬</span>
                    <div className="tx"><b>Render bản hoàn chỉnh</b><small>1080p · MP4</small></div>
                    <span className="st run">Chờ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* STRIP */}
      <div className="strip">
        <div className="wrap">
          <span>✓ Windows 10/11 x64</span>
          <span>✓ macOS Apple Silicon</span>
          <span>✓ Cài đặt &lt; 1 phút</span>
          <span>✓ Dữ liệu trên máy bạn</span>
          <span>✓ Tự động cập nhật</span>
        </div>
      </div>

      {/* FEATURES */}
      <section className="block" id="features">
        <div className="wrap">
          <div className="eyebrow">Tính năng</div>
          <h2 className="h2">Cả quy trình lồng tiếng video, gói gọn trong một app.</h2>
          <div className="feat-grid">
            {features.map((f) => (
              <div className="card" key={f.h}>
                <span className={`badge ${f.b}`}>{f.ico}</span>
                <h3>{f.h}</h3>
                <p>{f.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO */}
      <section className="block" id="demo" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="eyebrow" style={{ textAlign: "center" }}>Demo</div>
          <h2 className="h2" style={{ margin: "0 auto", textAlign: "center" }}>Xem {name} hoạt động</h2>
          <p className="sec-intro" style={{ margin: "16px auto 0", textAlign: "center" }}>
            Từ video gốc đến bản lồng tiếng + phụ đề tiếng Việt — tự động, ngay trên máy.
          </p>
          <div className="demo-frame">
            {demo.kind === "youtube" && (
              <iframe
                src={demo.src}
                title="Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
            {demo.kind === "video" && <video src={demo.src} controls preload="metadata" />}
            {demo.kind === "none" && <div className="demo-placeholder">🎬 Video demo sẽ sớm được cập nhật</div>}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="block" id="pricing">
        <div className="wrap">
          <div className="eyebrow">Báo giá</div>
          <h2 className="h2" style={{ margin: "0 auto" }}>Một mức giá. Không thuê bao.</h2>
          <p className="sec-intro" style={{ margin: "16px auto 0" }}>
            Trả một lần, sở hữu vĩnh viễn kèm cập nhật miễn phí. Đơn giản vậy thôi.
          </p>
          <div className="price-wrap">
            <div className="price-card">
              <span className="price-tag">{p.promoActive ? `−${p.discountPercent}% RA MẮT` : "PHỔ BIẾN"}</span>
              <div className="plan">Bản quyền trọn đời</div>
              <div className="price-amount">
                <span className="num">{priceText}</span>
                {p.promoActive && <span className="strike">{vnd(p.basePrice)}</span>}
              </div>
              <span className="once">Thanh toán một lần</span>
              {p.promoActive && p.promoEndsAt && (
                <div><Countdown endsAt={p.promoEndsAt} /></div>
              )}
              <ul className="price-feats">
                <li><span className="ck">✓</span> Toàn bộ tính năng dịch + lồng tiếng + render</li>
                <li><span className="ck">✓</span> Dùng vĩnh viễn trên máy của bạn</li>
                <li><span className="ck">✓</span> Cập nhật phiên bản miễn phí, tự động</li>
                <li><span className="ck">✓</span> Link tải gửi qua email tự động</li>
                <li><span className="ck">✓</span> Hỗ trợ trực tiếp qua nhóm Zalo</li>
              </ul>
              <BuyButton className="btn btn-primary btn-block">Mua &amp; nhận link tải</BuyButton>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORT / ZALO */}
      <section className="block" id="support">
        <div className="wrap">
          <div>
            <div className="eyebrow">Hỗ trợ</div>
            <h2 className="h2">Cần giúp đỡ? Nhắn nhóm Zalo.</h2>
            <p className="sec-intro">
              Tham gia nhóm Zalo để được hỗ trợ cài đặt, nhận thông báo cập nhật và trao đổi
              trực tiếp với đội ngũ. Phản hồi nhanh trong giờ làm việc.
            </p>
          </div>
          <div className="zalo-card">
            <div className="zi">Z</div>
            <h3>Nhóm hỗ trợ {name}</h3>
            <p>Đặt câu hỏi, báo lỗi hoặc xin trợ giúp cài đặt giọng/đường truyền. Cả cộng đồng và đội ngũ cùng hỗ trợ bạn.</p>
            <a className="btn btn-primary btn-block" href={zalo} target="_blank" rel="noopener noreferrer">
              Tham gia nhóm Zalo
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="eyebrow">Câu hỏi thường gặp</div>
          <h2 className="h2" style={{ marginBottom: 40 }}>Những điều bạn có thể thắc mắc.</h2>
          <Faq items={faqItems} />
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div>
            <span className="brand">{Logo}{name}</span>
            <p className="fdesc">Ứng dụng desktop dịch, lồng tiếng và render video bằng AI. Trả một lần, dùng mãi mãi.</p>
          </div>
          <div className="fcol">
            <h4>Sản phẩm</h4>
            <a href="#features">Tính năng</a>
            <a href="#demo">Demo</a>
            <a href="#pricing">Báo giá</a>
          </div>
          <div className="fcol">
            <h4>Hỗ trợ</h4>
            <a href={zalo} target="_blank" rel="noopener noreferrer">Nhóm Zalo</a>
            <a href="#pricing">Mua bản quyền</a>
          </div>
        </div>
        <div className="copy">© {new Date().getFullYear()} {name}. Thanh toán an toàn qua PayOS · VietQR.</div>
      </footer>

      <BuyModal productName={name} priceText={priceText} />
    </>
  );
}
