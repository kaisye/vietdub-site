import { getSettings, pricing } from "@/lib/settings";
import Countdown from "./Countdown";
import BuyButton from "./components/BuyButton";
import BuyModal from "./components/BuyModal";
import Faq, { type FaqItem } from "./components/Faq";

export const dynamic = "force-dynamic";

type Lang = "vi" | "en";

function vnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "₫";
}

function pickLang(value?: string): Lang {
  return value === "en" ? "en" : "vi";
}

function langHref(lang: Lang, hash = "") {
  const query = lang === "en" ? "?lang=en" : "/";
  return `${query}${hash}`;
}

// Normalise a YouTube link to an embeddable URL; otherwise treat as a video file.
function toEmbed(url: string): { kind: "youtube" | "video" | "none"; src: string } {
  if (!url) return { kind: "none", src: "" };
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: "youtube", src: `https://www.youtube.com/embed/${yt[1]}` };
  return { kind: "video", src: url };
}

const copy = {
  vi: {
    maintenanceDefault:
      "Chúng tôi đang nâng cấp hệ thống để phục vụ bạn tốt hơn. Vui lòng quay lại sau ít phút. Cảm ơn bạn đã kiên nhẫn!",
    maintenanceBadge: "Đang bảo trì",
    maintenanceTitle: (name: string) => `${name} đang được bảo trì`,
    maintenanceCta: "Liên hệ hỗ trợ qua Zalo",
    nav: {
      features: "Tính năng",
      demo: "Demo",
      pricing: "Báo giá",
      support: "Hỗ trợ",
      buy: "Mua ngay",
    },
    hero: {
      pill: "Miễn phí vận hành · Windows & macOS",
      titleA: "Lồng tiếng & phụ đề video,",
      titleB: "không tốn một xu vận hành.",
      lead: (name: string) =>
        `Dán link YouTube, Facebook hoặc Douyin để ${name} tải, dịch, lồng tiếng và render video ngay trên máy bạn — không cần API trả phí, không cần GPU (có thì càng nhanh). Phụ đề STT/OCR, giọng Edge AI và nhân bản giọng OmniVoice. Trả một lần, dùng mãi mãi.`,
      buy: (price: string) => `Mua bản quyền — ${price}`,
      demo: "Xem demo",
      ticks: ["Không API trả phí", "Không cần GPU", "Chạy cục bộ, riêng tư"],
    },
    flowTitle: (name: string) => `${name} — Tiến trình dự án`,
    flow: [
      { b: "b-sky", ico: "📥", h: "Tải video đa nền tảng", p: "YouTube · Facebook · Douyin · STT/OCR", status: "Xong" },
      { b: "b-mint", ico: "🌐", h: "Dịch phụ đề khớp thời gian", p: "EN → VI · 320 dòng", status: "Xong" },
      { b: "b-peach", ico: "🎙️", h: "Lồng tiếng · Edge AI / OmniVoice", p: "Đang tổng hợp…", status: "Đang chạy" },
      { b: "b-lilac", ico: "🎬", h: "Render bản hoàn chỉnh", p: "1080p · MP4", status: "Chờ" },
    ],
    strip: [
      "YouTube · Facebook · Douyin",
      "Không API trả phí",
      "Không cần GPU",
      "macOS Apple Silicon",
      "Cài đặt < 5 phút",
      "Tự động cập nhật",
    ],
    featuresEyebrow: "Tính năng",
    featuresTitle: "Cả quy trình lồng tiếng video, miễn phí vận hành — gói trong một app.",
    features: [
      { b: "b-sky", ico: "📥", h: "Tải video đa nền tảng", p: "Tải trực tiếp từ YouTube, Facebook, Douyin… rồi tạo phụ đề bằng STT, bóc phụ đề cứng bằng OCR, hoặc nạp .srt có sẵn." },
      { b: "b-mint", ico: "🌐", h: "Dịch khớp thời gian", p: "Dịch tự động sang tiếng Việt, giữ nguyên timing từng dòng để phụ đề và lời thoại luôn khít với video." },
      { b: "b-peach", ico: "🎙️", h: "Lồng tiếng Edge AI", p: "Hàng chục giọng đọc tự nhiên, dùng được ngay — không cần cấu hình cao, không cần GPU, không tốn API trả phí." },
      { b: "b-lilac", ico: "🧬", h: "Nhân bản giọng OmniVoice", p: "Clone giọng từ chính mẫu giọng của bạn, chạy qua Google Colab miễn phí hoặc bằng GPU nếu có." },
      { b: "b-sand", ico: "⏱️", h: "Khớp tốc độ & nhạc nền", p: "Tự chỉnh tốc độ đọc cho khít timing gốc; giữ nhạc nền và thêm hiệu ứng âm thanh khi cần." },
      { b: "b-teal", ico: "🎬", h: "Render & tự cập nhật", p: "Xuất video hoàn chỉnh với FFmpeg tích hợp; app chạy cục bộ, riêng tư và tự cài bản cập nhật đã ký an toàn." },
    ],
    demoSection: {
      eyebrow: "Demo",
      title: (name: string) => `Xem ${name} hoạt động`,
      intro: "Từ video gốc đến bản lồng tiếng + phụ đề tiếng Việt — tự động, ngay trên máy.",
      placeholder: "🎬 Video demo sẽ sớm được cập nhật",
      facebook: (name: string) => `Xem thêm video dịch bằng ${name} trên Facebook`,
    },
    pricing: {
      eyebrow: "Báo giá",
      title: "Một mức giá. Không thuê bao.",
      intro: "Trả một lần, sở hữu vĩnh viễn kèm cập nhật miễn phí — và không tốn thêm chi phí API hay GPU nào.",
      promo: (discount: number) => `−${discount}% RA MẮT`,
      popular: "PHỔ BIẾN",
      plan: "Bản quyền trọn đời",
      once: "Thanh toán một lần",
      features: [
        "Toàn bộ tính năng phụ đề + dịch + lồng tiếng + render",
        "Không tốn API trả phí, không cần GPU",
        "Dùng vĩnh viễn trên máy của bạn",
        "Cập nhật phiên bản miễn phí, tự động",
        "Vào nhóm Zalo hỗ trợ trực tiếp",
      ],
      cta: "Mua & nhận link tải",
    },
    support: {
      eyebrow: "Hỗ trợ",
      title: "Mua bản quyền là vào thẳng nhóm Zalo.",
      intro:
        "Khách đã thanh toán được mời vào nhóm Zalo riêng để được hỗ trợ cài đặt, hướng dẫn nhân bản giọng, nhận thông báo cập nhật và trao đổi trực tiếp với đội ngũ. Phản hồi nhanh trong giờ làm việc.",
      cardTitle: (name: string) => `Nhóm hỗ trợ ${name}`,
      cardBody:
        "Đặt câu hỏi, báo lỗi hoặc xin hướng dẫn cấu hình giọng/đường truyền. Cả cộng đồng và đội ngũ cùng hỗ trợ bạn.",
      note: "Link tham gia nhóm Zalo được gửi qua email ngay sau khi bạn thanh toán bản quyền.",
    },
    faqEyebrow: "Câu hỏi thường gặp",
    faqTitle: "Những điều bạn có thể thắc mắc.",
    faqItems: [
      { q: "Mua một lần thì dùng được bao lâu?", a: "Vĩnh viễn. Sau khi thanh toán bạn nhận link tải về email và dùng được mãi trên máy của mình, kèm các bản cập nhật miễn phí." },
      { q: "Tôi nhận phần mềm và vào nhóm Zalo bằng cách nào?", a: "Sau khi quét VietQR và chuyển khoản, hệ thống tự xác nhận trong vài giây rồi gửi link tải + link nhóm Zalo hỗ trợ về email, đồng thời hiện ngay trên trang cảm ơn." },
      { q: "Có tốn chi phí API hay cần GPU không?", a: "Không. Giọng Edge AI cùng phần nhận dạng và dịch dùng engine miễn phí, chạy tốt trên laptop thường mà không cần GPU. Nếu muốn nhân bản giọng bằng OmniVoice, bạn chạy qua Google Colab miễn phí hoặc dùng GPU để nhanh hơn." },
      { q: "Chạy được trên hệ điều hành nào?", a: "Windows 10/11 (x64) và macOS chip Apple Silicon (M1 trở lên). Trình cài đặt tự lo môi trường cần thiết, không cần quyền admin." },
      { q: "Dữ liệu của tôi có an toàn không?", a: "Có. App chạy cục bộ, backend chỉ bind 127.0.0.1, video và cấu hình không gửi lên máy chủ của chúng tôi. Bạn toàn quyền kiểm soát." },
    ],
    footer: {
      desc: "Ứng dụng desktop dịch, lồng tiếng và render video bằng AI. Miễn phí vận hành, trả một lần, dùng mãi mãi.",
      product: "Sản phẩm",
      social: "Theo dõi & hỗ trợ",
      facebook: "Facebook — video demo",
      buy: "Mua bản quyền",
      zalo: "Nhóm Zalo (qua mua bản quyền)",
      copy: (year: number, name: string) => `© ${year} ${name}. Thanh toán an toàn qua PayOS · VietQR.`,
    },
  },
  en: {
    maintenanceDefault:
      "We are upgrading the system to serve you better. Please come back in a few minutes. Thanks for your patience!",
    maintenanceBadge: "Maintenance",
    maintenanceTitle: (name: string) => `${name} is under maintenance`,
    maintenanceCta: "Contact support on Zalo",
    nav: {
      features: "Features",
      demo: "Demo",
      pricing: "Pricing",
      support: "Support",
      buy: "Buy now",
    },
    hero: {
      pill: "Free to run · Windows & macOS",
      titleA: "AI video dubbing & subtitles,",
      titleB: "with no running cost.",
      lead: (name: string) =>
        `Paste a YouTube, Facebook, or Douyin link and ${name} downloads, translates, dubs, and renders the video on your own machine — no paid APIs, no GPU required (faster if you have one). Includes STT/OCR subtitles, Edge AI voices, and OmniVoice voice cloning. Pay once, use forever.`,
      buy: (price: string) => `Buy license — ${price}`,
      demo: "Watch demo",
      ticks: ["No paid API", "No GPU required", "Local and private"],
    },
    flowTitle: (name: string) => `${name} — Project pipeline`,
    flow: [
      { b: "b-sky", ico: "📥", h: "Multi-platform download", p: "YouTube · Facebook · Douyin · STT/OCR", status: "Done" },
      { b: "b-mint", ico: "🌐", h: "Time-aligned subtitles", p: "EN → VI · 320 lines", status: "Done" },
      { b: "b-peach", ico: "🎙️", h: "Dubbing · Edge AI / OmniVoice", p: "Synthesizing…", status: "Running" },
      { b: "b-lilac", ico: "🎬", h: "Final render", p: "1080p · MP4", status: "Queued" },
    ],
    strip: [
      "YouTube · Facebook · Douyin",
      "No paid API",
      "No GPU required",
      "macOS Apple Silicon",
      "Install in < 5 minutes",
      "Automatic updates",
    ],
    featuresEyebrow: "Features",
    featuresTitle: "The full video dubbing workflow, free to run — packed into one app.",
    features: [
      { b: "b-sky", ico: "📥", h: "Multi-platform video download", p: "Download directly from YouTube, Facebook, Douyin, and more, then create subtitles with STT, extract hard-subs with OCR, or import your own .srt file." },
      { b: "b-mint", ico: "🌐", h: "Time-aligned translation", p: "Automatically translate to Vietnamese while preserving line-level timing, so subtitles and speech stay synced with the video." },
      { b: "b-peach", ico: "🎙️", h: "Edge AI dubbing", p: "Dozens of natural voices ready to use — no high-end setup, no GPU, and no paid API required." },
      { b: "b-lilac", ico: "🧬", h: "OmniVoice voice cloning", p: "Clone a voice from your own sample via free Google Colab or a local GPU when available." },
      { b: "b-sand", ico: "⏱️", h: "Speed fit & background audio", p: "Fit speech speed to the original timing, keep background music, and add sound effects when needed." },
      { b: "b-teal", ico: "🎬", h: "Render & auto-update", p: "Export finished videos with bundled FFmpeg; the app runs locally, privately, and installs signed updates safely." },
    ],
    demoSection: {
      eyebrow: "Demo",
      title: (name: string) => `See ${name} in action`,
      intro: "From source video to Vietnamese dubbing and subtitles — automatically, on your machine.",
      placeholder: "🎬 Demo video coming soon",
      facebook: (name: string) => `Watch more videos made with ${name} on Facebook`,
    },
    pricing: {
      eyebrow: "Pricing",
      title: "One price. No subscription.",
      intro: "Pay once, own it forever with free updates — and no extra API or GPU costs.",
      promo: (discount: number) => `−${discount}% LAUNCH`,
      popular: "POPULAR",
      plan: "Lifetime license",
      once: "One-time payment",
      features: [
        "All subtitle, translation, dubbing, and rendering features",
        "No paid API and no GPU required",
        "Use forever on your own machine",
        "Free automatic version updates",
        "Access to the private Zalo support group",
      ],
      cta: "Buy & get download link",
    },
    support: {
      eyebrow: "Support",
      title: "A license includes access to the Zalo support group.",
      intro:
        "Paid customers are invited to a private Zalo group for installation support, voice cloning guidance, update announcements, and direct help from the team during working hours.",
      cardTitle: (name: string) => `${name} support group`,
      cardBody:
        "Ask questions, report bugs, or get help with voice and connection setup. The community and the team can both help you move faster.",
      note: "The Zalo group invite is emailed right after your license payment is confirmed.",
    },
    faqEyebrow: "FAQ",
    faqTitle: "Things you may want to know.",
    faqItems: [
      { q: "How long can I use it after buying once?", a: "Forever. After payment, you receive a download link by email and can keep using VietDub on your own machine, with free updates included." },
      { q: "How do I receive the app and join the Zalo group?", a: "After you pay via VietQR, the system confirms the payment within seconds, emails the download link and Zalo support link, and also shows them on the thank-you page." },
      { q: "Do I need paid APIs or a GPU?", a: "No. Edge AI voices and the recognition/translation pipeline are designed to run without paid APIs and work well on regular laptops. OmniVoice voice cloning can run through free Google Colab or on your GPU for faster results." },
      { q: "Which platforms are supported?", a: "Windows 10/11 (x64) and Apple Silicon macOS (M1 or newer). The installer sets up the needed runtime without admin rights." },
      { q: "Is my data private?", a: "Yes. The app runs locally, the backend only binds to 127.0.0.1, and your videos and settings are not uploaded to our servers. You stay in control." },
    ],
    footer: {
      desc: "A desktop app for AI video translation, dubbing, and rendering. Free to run, pay once, use forever.",
      product: "Product",
      social: "Social & support",
      facebook: "Facebook — demo videos",
      buy: "Buy license",
      zalo: "Zalo group (after license purchase)",
      copy: (year: number, name: string) => `© ${year} ${name}. Secure payment via PayOS · VietQR.`,
    },
  },
} satisfies Record<Lang, {
  maintenanceDefault: string;
  maintenanceBadge: string;
  maintenanceTitle: (name: string) => string;
  maintenanceCta: string;
  nav: Record<string, string>;
  hero: {
    pill: string;
    titleA: string;
    titleB: string;
    lead: (name: string) => string;
    buy: (price: string) => string;
    demo: string;
    ticks: string[];
  };
  flowTitle: (name: string) => string;
  flow: Array<{ b: string; ico: string; h: string; p: string; status: string }>;
  strip: string[];
  featuresEyebrow: string;
  featuresTitle: string;
  features: Array<{ b: string; ico: string; h: string; p: string }>;
  demoSection: {
    eyebrow: string;
    title: (name: string) => string;
    intro: string;
    placeholder: string;
    facebook: (name: string) => string;
  };
  pricing: {
    eyebrow: string;
    title: string;
    intro: string;
    promo: (discount: number) => string;
    popular: string;
    plan: string;
    once: string;
    features: string[];
    cta: string;
  };
  support: {
    eyebrow: string;
    title: string;
    intro: string;
    cardTitle: (name: string) => string;
    cardBody: string;
    note: string;
  };
  faqEyebrow: string;
  faqTitle: string;
  faqItems: FaqItem[];
  footer: {
    desc: string;
    product: string;
    social: string;
    facebook: string;
    buy: string;
    zalo: string;
    copy: (year: number, name: string) => string;
  };
}>;

function MaintenanceScreen({
  name,
  message,
  zaloUrl,
  t,
}: {
  name: string;
  message: string;
  zaloUrl: string;
  t: (typeof copy)[Lang];
}) {
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
        <span className="pill"><span className="dot" /> {t.maintenanceBadge}</span>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", margin: 0 }}>
          {t.maintenanceTitle(name)}
        </h1>
        <p className="lead" style={{ maxWidth: 560, margin: 0 }}>
          {message || t.maintenanceDefault}
        </p>
        {zaloUrl && (
          <a className="btn btn-primary" href={zaloUrl} target="_blank" rel="noopener noreferrer">
            {t.maintenanceCta}
          </a>
        )}
        <p style={{ color: "var(--muted, #888)", fontSize: 13, marginTop: 8 }}>
          © {new Date().getFullYear()} {name}
        </p>
      </div>
    </>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams?: { lang?: string };
}) {
  const lang = pickLang(searchParams?.lang);
  const t = copy[lang];
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
        t={t}
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
            <a className="brand" href={langHref(lang, "#top")}>{Logo}{name}</a>
            <div className="navlinks">
              <a href={langHref(lang, "#features")} className="hide-sm">{t.nav.features}</a>
              <a href={langHref(lang, "#demo")} className="hide-sm">{t.nav.demo}</a>
              <a href={langHref(lang, "#pricing")} className="hide-sm">{t.nav.pricing}</a>
              <a href={langHref(lang, "#support")} className="hide-sm">{t.nav.support}</a>
              <div className="lang-switch" aria-label="Language">
                <a className={lang === "vi" ? "active" : ""} href="/">VI</a>
                <a className={lang === "en" ? "active" : ""} href="/?lang=en">EN</a>
              </div>
              <BuyButton className="nav-cta">{t.nav.buy}</BuyButton>
            </div>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <div className="wrap" id="top">
        <section className="hero">
          <span className="pill"><span className="dot" /> {t.hero.pill}</span>
          <h1>{t.hero.titleA}<br /><span className="hl">{t.hero.titleB}</span></h1>
          <p className="lead">{t.hero.lead(name)}</p>
          <div className="cta-row">
            <BuyButton className="btn btn-primary">{t.hero.buy(priceText)}</BuyButton>
            <a className="btn" href={langHref(lang, "#demo")}>{t.hero.demo}</a>
          </div>
          <div className="ticks">
            {t.hero.ticks.map((tick) => (
              <span key={tick}><span className="ck">✓</span> {tick}</span>
            ))}
          </div>
        </section>

        {/* FLOW — horizontal banner under the headline */}
        <div className="stage stage-wide">
          <div className="app-window">
            <div className="app-bar"><i /><i /><i /><span className="ttl">{t.flowTitle(name)}</span></div>
            <div className="app-body">
              {t.flow.map((item, index) => (
                <div className="task-row" key={item.h}>
                  <span className={`ic ${item.b}`}>{item.ico}</span>
                  <div className="tx"><b>{item.h}</b><small>{item.p}</small></div>
                  <span className={`st ${index < 2 ? "done" : "run"}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STRIP */}
      <div className="strip">
        <div className="wrap">
          {t.strip.map((item) => (
            <span key={item}>✓ {item}</span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="block" id="features">
        <div className="wrap">
          <div className="eyebrow">{t.featuresEyebrow}</div>
          <h2 className="h2">{t.featuresTitle}</h2>
          <div className="feat-grid">
            {t.features.map((f) => (
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
          <div className="eyebrow" style={{ textAlign: "center" }}>{t.demoSection.eyebrow}</div>
          <h2 className="h2" style={{ margin: "0 auto", textAlign: "center" }}>{t.demoSection.title(name)}</h2>
          <p className="sec-intro" style={{ margin: "16px auto 0", textAlign: "center" }}>
            {t.demoSection.intro}
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
            {demo.kind === "none" && <div className="demo-placeholder">{t.demoSection.placeholder}</div>}
          </div>
          {fb && (
            <div style={{ marginTop: 26, display: "flex", justifyContent: "center" }}>
              <a className="btn" href={fb} target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ fill: "#1877f2" }} aria-hidden>
                  <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.9 3.78-3.9 1.1 0 2.24.19 2.24.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
                </svg>
                {t.demoSection.facebook(name)}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* PRICING */}
      <section className="block" id="pricing">
        <div className="wrap">
          <div className="eyebrow">{t.pricing.eyebrow}</div>
          <h2 className="h2" style={{ margin: "0 auto" }}>{t.pricing.title}</h2>
          <p className="sec-intro" style={{ margin: "16px auto 0" }}>
            {t.pricing.intro}
          </p>
          <div className="price-wrap">
            <div className="price-card">
              <span className="price-tag">{p.promoActive ? t.pricing.promo(p.discountPercent) : t.pricing.popular}</span>
              <div className="plan">{t.pricing.plan}</div>
              <div className="price-amount">
                <span className="num">{priceText}</span>
                {p.promoActive && <span className="strike">{vnd(p.basePrice)}</span>}
              </div>
              <span className="once">{t.pricing.once}</span>
              {p.promoActive && p.promoEndsAt && (
                <div><Countdown endsAt={p.promoEndsAt} /></div>
              )}
              <ul className="price-feats">
                {t.pricing.features.map((item) => (
                  <li key={item}><span className="ck">✓</span> {item}</li>
                ))}
              </ul>
              <BuyButton className="btn btn-primary btn-block">{t.pricing.cta}</BuyButton>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORT / ZALO */}
      <section className="block" id="support">
        <div className="wrap">
          <div>
            <div className="eyebrow">{t.support.eyebrow}</div>
            <h2 className="h2">{t.support.title}</h2>
            <p className="sec-intro">{t.support.intro}</p>
          </div>
          <div className="zalo-card">
            <div className="zi">Z</div>
            <h3>{t.support.cardTitle(name)}</h3>
            <p>{t.support.cardBody}</p>
            <div className="pay-note">
              <span>💳</span>
              <div>{t.support.note}</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="eyebrow">{t.faqEyebrow}</div>
          <h2 className="h2" style={{ marginBottom: 40 }}>{t.faqTitle}</h2>
          <Faq items={t.faqItems} />
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div>
            <span className="brand">{Logo}{name}</span>
            <p className="fdesc">{t.footer.desc}</p>
          </div>
          <div className="fcol">
            <h4>{t.footer.product}</h4>
            <a href={langHref(lang, "#features")}>{t.nav.features}</a>
            <a href={langHref(lang, "#demo")}>{t.nav.demo}</a>
            <a href={langHref(lang, "#pricing")}>{t.nav.pricing}</a>
          </div>
          <div className="fcol">
            <h4>{t.footer.social}</h4>
            {fb && <a href={fb} target="_blank" rel="noopener noreferrer">{t.footer.facebook}</a>}
            <a href={langHref(lang, "#pricing")}>{t.footer.buy}</a>
            <a href={langHref(lang, "#support")}>{t.footer.zalo}</a>
          </div>
        </div>
        <div className="copy">{t.footer.copy(new Date().getFullYear(), name)}</div>
      </footer>

      <BuyModal productName={name} priceText={priceText} language={lang} />
    </>
  );
}
