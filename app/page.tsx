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

// Six pillars of the pipeline. Subtitle & translation are split into two so the
// grid stays at six even without the (removed) source-separation card.
const features = [
  { b: "b-sky", ico: "📥", h: "Tải video đa nền tảng", p: "Tải trực tiếp từ YouTube, Facebook, Douyin… rồi tạo phụ đề bằng STT, bóc phụ đề cứng bằng OCR, hoặc nạp .srt có sẵn." },
  { b: "b-mint", ico: "🌐", h: "Dịch khớp thời gian", p: "Dịch tự động sang tiếng Việt, giữ nguyên timing từng dòng để phụ đề và lời thoại luôn khít với video." },
  { b: "b-peach", ico: "🎙️", h: "Lồng tiếng Edge AI", p: "Hàng chục giọng đọc tự nhiên, dùng được ngay — không cần cấu hình cao, không cần GPU, không tốn API trả phí." },
  { b: "b-lilac", ico: "🧬", h: "Nhân bản giọng OmniVoice", p: "Clone giọng từ chính mẫu giọng của bạn, chạy qua Google Colab miễn phí hoặc bằng GPU nếu có." },
  { b: "b-sand", ico: "⏱️", h: "Khớp tốc độ & nhạc nền", p: "Tự chỉnh tốc độ đọc cho khít timing gốc; giữ nhạc nền và thêm hiệu ứng âm thanh khi cần." },
  { b: "b-teal", ico: "🎬", h: "Render & tự cập nhật", p: "Xuất video hoàn chỉnh với FFmpeg tích hợp; app chạy cục bộ, riêng tư và tự cài bản cập nhật đã ký an toàn." },
];

const faqItems: FaqItem[] = [
  { q: "Mua một lần thì dùng được bao lâu?", a: "Vĩnh viễn. Sau khi thanh toán bạn nhận link tải về email và dùng được mãi trên máy của mình, kèm các bản cập nhật miễn phí." },
  { q: "Tôi nhận phần mềm và vào nhóm Zalo bằng cách nào?", a: "Sau khi quét VietQR và chuyển khoản, hệ thống tự xác nhận trong vài giây rồi gửi link tải + link nhóm Zalo hỗ trợ về email, đồng thời hiện ngay trên trang cảm ơn." },
  { q: "Có tốn chi phí API hay cần GPU không?", a: "Không. Giọng Edge AI cùng phần nhận dạng và dịch dùng engine miễn phí, chạy tốt trên laptop thường mà không cần GPU. Nếu muốn nhân bản giọng bằng OmniVoice, bạn chạy qua Google Colab miễn phí hoặc dùng GPU để nhanh hơn." },
  { q: "Chạy được trên hệ điều hành nào?", a: "Windows 10/11 (x64) và macOS chip Apple Silicon (M1 trở lên). Trình cài đặt tự lo môi trường cần thiết, không cần quyền admin." },
  { q: "Dữ liệu của tôi có an toàn không?", a: "Có. App chạy cục bộ, backend chỉ bind 127.0.0.1, video và cấu hình không gửi lên máy chủ của chúng tôi. Bạn toàn quyền kiểm soát." },
];

const MAINTENANCE_DEFAULT =
  "Chúng tôi đang nâng cấp hệ thống để phục vụ bạn tốt hơn. Vui lòng quay lại sau ít phút. Cảm ơn bạn đã kiên nhẫn!";

function MaintenanceScreen({ name, message, zaloUrl }: { name: string; message: string; zaloUrl: string }) {
  return (
    <>
      <div className="topband" />
      <div
        className="wrap"
        style={{
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 18,
          padding: "64px 20px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt={`${name} logo`} width={64} height={64} style={{ borderRadius: 14 }} />
        <span className="pill"><span className="dot" /> Đang bảo trì</span>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", margin: 0 }}>
          {name} đang được bảo trì
        </h1>
        <p className="lead" style={{ maxWidth: 560, margin: 0 }}>
          {message || MAINTENANCE_DEFAULT}
        </p>
        {zaloUrl && (
          <a className="btn btn-primary" href={zaloUrl} target="_blank" rel="noopener noreferrer">
            Liên hệ hỗ trợ qua Zalo
          </a>
        )}
        <p style={{ color: "var(--muted, #888)", fontSize: 13, marginTop: 8 }}>
          © {new Date().getFullYear()} {name}
        </p>
      </div>
    </>
  );
}

export default async function Home() {
  const settings = await getSettings();

  // Maintenance mode: take over the storefront entirely. Downloads, the success
  // page, and /admin stay reachable so paid customers and the operator aren't
  // locked out — only the marketing/buy flow is hidden here.
  if (settings.maintenance) {
    return (
      <MaintenanceScreen
        name={settings.productName}
        message={settings.maintenanceMessage}
        zaloUrl={settings.zaloGroupUrl}
      />
    );
  }

  const p = pricing(settings);
  const demo = toEmbed(settings.demoVideoUrl);
  const priceText = vnd(p.price);
  const name = settings.productName;
  const fb = settings.facebookUrl;

  const Logo = (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="logo" src="/logo.png" alt={`${name} logo`} width={40} height={40} />
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
          <span className="pill"><span className="dot" /> Miễn phí vận hành · Windows &amp; macOS</span>
          <h1>Lồng tiếng &amp; phụ đề video,<br /><span className="hl">không tốn một xu vận hành.</span></h1>
          <p className="lead">
            Dán link YouTube, Facebook hoặc Douyin để {name} tải, dịch, lồng tiếng và render video
            ngay trên máy bạn — không cần API trả phí, không cần GPU (có thì càng nhanh). Phụ đề
            STT/OCR, giọng Edge AI và nhân bản giọng OmniVoice. Trả một lần, dùng mãi mãi.
          </p>
          <div className="cta-row">
            <BuyButton className="btn btn-primary">Mua bản quyền — {priceText}</BuyButton>
            <a className="btn" href="#demo">Xem demo</a>
          </div>
          <div className="ticks">
            <span><span className="ck">✓</span> Không API trả phí</span>
            <span><span className="ck">✓</span> Không cần GPU</span>
            <span><span className="ck">✓</span> Chạy cục bộ, riêng tư</span>
          </div>
        </section>

        {/* FLOW — horizontal banner under the headline */}
        <div className="stage stage-wide">
          <div className="app-window">
            <div className="app-bar"><i /><i /><i /><span className="ttl">{name} — Tiến trình dự án</span></div>
            <div className="app-body">
              <div className="task-row">
                <span className="ic b-sky">📥</span>
                <div className="tx"><b>Tải video đa nền tảng</b><small>YouTube · Facebook · Douyin · STT/OCR</small></div>
                <span className="st done">Xong</span>
              </div>
              <div className="task-row">
                <span className="ic b-mint">🌐</span>
                <div className="tx"><b>Dịch phụ đề khớp thời gian</b><small>EN → VI · 320 dòng</small></div>
                <span className="st done">Xong</span>
              </div>
              <div className="task-row">
                <span className="ic b-peach">🎙️</span>
                <div className="tx"><b>Lồng tiếng · Edge AI / OmniVoice</b><small>Đang tổng hợp…</small></div>
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

      {/* STRIP */}
      <div className="strip">
        <div className="wrap">
          <span>✓ YouTube · Facebook · Douyin</span>
          <span>✓ Không API trả phí</span>
          <span>✓ Không cần GPU</span>
          <span>✓ macOS Apple Silicon</span>
          <span>✓ Cài đặt &lt; 5 phút</span>
          <span>✓ Tự động cập nhật</span>
        </div>
      </div>

      {/* FEATURES */}
      <section className="block" id="features">
        <div className="wrap">
          <div className="eyebrow">Tính năng</div>
          <h2 className="h2">Cả quy trình lồng tiếng video, miễn phí vận hành — gói trong một app.</h2>
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
          {fb && (
            <div style={{ marginTop: 26, display: "flex", justifyContent: "center" }}>
              <a className="btn" href={fb} target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ fill: "#1877f2" }} aria-hidden>
                  <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.9 3.78-3.9 1.1 0 2.24.19 2.24.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
                </svg>
                Xem thêm video dịch bằng {name} trên Facebook
              </a>
            </div>
          )}
        </div>
      </section>

      {/* PRICING */}
      <section className="block" id="pricing">
        <div className="wrap">
          <div className="eyebrow">Báo giá</div>
          <h2 className="h2" style={{ margin: "0 auto" }}>Một mức giá. Không thuê bao.</h2>
          <p className="sec-intro" style={{ margin: "16px auto 0" }}>
            Trả một lần, sở hữu vĩnh viễn kèm cập nhật miễn phí — và không tốn thêm chi phí API hay GPU nào.
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
                <li><span className="ck">✓</span> Toàn bộ tính năng phụ đề + dịch + lồng tiếng + render</li>
                <li><span className="ck">✓</span> Không tốn API trả phí, không cần GPU</li>
                <li><span className="ck">✓</span> Dùng vĩnh viễn trên máy của bạn</li>
                <li><span className="ck">✓</span> Cập nhật phiên bản miễn phí, tự động</li>
                <li><span className="ck">✓</span> Vào nhóm Zalo hỗ trợ trực tiếp</li>
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
            <h2 className="h2">Mua bản quyền là vào thẳng nhóm Zalo.</h2>
            <p className="sec-intro">
              Khách đã thanh toán được mời vào nhóm Zalo riêng để được hỗ trợ cài đặt, hướng dẫn nhân
              bản giọng, nhận thông báo cập nhật và trao đổi trực tiếp với đội ngũ. Phản hồi nhanh
              trong giờ làm việc.
            </p>
          </div>
          <div className="zalo-card">
            <div className="zi">Z</div>
            <h3>Nhóm hỗ trợ {name}</h3>
            <p>Đặt câu hỏi, báo lỗi hoặc xin hướng dẫn cấu hình giọng/đường truyền. Cả cộng đồng và đội ngũ cùng hỗ trợ bạn.</p>
            <div className="pay-note">
              <span>💳</span>
              <div>Link tham gia nhóm Zalo được gửi qua email ngay sau khi bạn thanh toán bản quyền.</div>
            </div>
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
            <p className="fdesc">Ứng dụng desktop dịch, lồng tiếng và render video bằng AI. Miễn phí vận hành, trả một lần, dùng mãi mãi.</p>
          </div>
          <div className="fcol">
            <h4>Sản phẩm</h4>
            <a href="#features">Tính năng</a>
            <a href="#demo">Demo</a>
            <a href="#pricing">Báo giá</a>
          </div>
          <div className="fcol">
            <h4>Theo dõi &amp; hỗ trợ</h4>
            {fb && <a href={fb} target="_blank" rel="noopener noreferrer">Facebook — video demo</a>}
            <a href="#pricing">Mua bản quyền</a>
            <a href="#support">Nhóm Zalo (qua mua bản quyền)</a>
          </div>
        </div>
        <div className="copy">© {new Date().getFullYear()} {name}. Thanh toán an toàn qua PayOS · VietQR.</div>
      </footer>

      <BuyModal productName={name} priceText={priceText} />
    </>
  );
}
