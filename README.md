# VietDub — Lồng tiếng & phụ đề video bằng AI, miễn phí vận hành

> 🛒 **Trang bán hàng:** **https://vietdub-site.vercel.app/**

**VietDub** là ứng dụng desktop (Windows & macOS) tự động **tải → dịch → lồng
tiếng → render** video ngay trên máy bạn. Dán link YouTube, Facebook hoặc Douyin,
VietDub lo phần còn lại — **không cần API trả phí, không cần GPU** (có thì nhanh
hơn), và mọi thứ chạy **cục bộ, riêng tư**. **Trả một lần, dùng mãi mãi**, kèm
cập nhật miễn phí.

## ✨ Tính năng

| | Tính năng | Mô tả |
|---|---|---|
| 📥 | **Tải video đa nền tảng** | Tải trực tiếp từ YouTube, Facebook, Douyin… Lấy phụ đề gốc theo thứ tự ưu tiên: phụ đề có sẵn → bóc **phụ đề cứng bằng OCR** → **nhận dạng giọng nói (STT)**; hoặc nạp file `.srt` của bạn. |
| 🌐 | **Dịch khớp thời gian** | Dịch tự động sang tiếng Việt, giữ nguyên timing từng dòng để phụ đề và lời thoại luôn khít với video. |
| 🎙️ | **Lồng tiếng Edge AI & NGHI-TTS** | Hàng chục giọng đọc tiếng Việt tự nhiên (kèm bộ giọng offline NGHI-TTS), dùng được ngay — không cần cấu hình cao, không cần GPU, không tốn API trả phí. |
| 🧬 | **Nhân bản giọng OmniVoice** | Clone giọng từ chính mẫu giọng của bạn, chạy qua **Google Colab miễn phí** hoặc bằng GPU nếu có; lưu sẵn nhiều tài khoản Google để đổi nhanh. |
| 🎨 | **Tùy biến & lưu style phụ đề** | Chỉnh font, màu, viền, vị trí…, **lưu style để lần sau chọn lại tức thì**; có thể **làm mờ vùng phụ đề cứng gốc** để che đi trước khi ghép phụ đề mới. |
| ⏱️ | **Khớp tốc độ & nhạc nền** | Tự chỉnh tốc độ đọc cho khít timing gốc; giữ nhạc nền và thêm hiệu ứng âm thanh khi cần. |
| 🎬 | **Render & tự cập nhật** | Xuất video hoàn chỉnh với **FFmpeg tích hợp**; app chạy cục bộ và tự cài bản cập nhật **đã ký an toàn**. |

## 💻 Nền tảng & yêu cầu

- **Windows 10/11 (x64)** và **macOS Apple Silicon (M1 trở lên)**.
- Trình cài đặt tự lo môi trường cần thiết — **không cần quyền admin**.
- **Không cần GPU**, **không tốn API trả phí**. Backend chỉ bind `127.0.0.1`, nên
  video và cấu hình của bạn **không gửi lên bất kỳ máy chủ nào**.

## 🛒 Mua bản quyền

👉 **https://vietdub-site.vercel.app/**

Trả một lần, sở hữu vĩnh viễn kèm cập nhật miễn phí. Thanh toán qua **VietQR
(PayOS)**: quét QR, hệ thống tự xác nhận trong vài giây rồi gửi **link tải + link
nhóm Zalo hỗ trợ** về email.

---

# 🧰 Về repo này — mã nguồn trang bán hàng

Phần dưới đây dành cho người **vận hành trang bán hàng**: web bán phần mềm VietDub
với **thanh toán tự động qua PayOS (VietQR)** — khách quét QR và chuyển khoản, hệ
thống tự xác nhận → lưu đơn vào **Google Sheet** → gửi **email link tải** + **link
nhóm Zalo**, và hiện link ngay trên trang cảm ơn. Toàn bộ chạy **miễn phí**: Vercel
(web + webhook) · Google Sheets (đơn hàng) · PayOS (thanh toán) · GitHub Releases
(file cài) · Gmail SMTP (email).

## Luồng hoạt động

```
Khách nhập email → /api/create-payment
   → tạo orderCode, ghi đơn PENDING vào Google Sheet
   → tạo link PayOS (VietQR) → chuyển khách sang trang thanh toán PayOS
Khách chuyển khoản
   → PayOS gọi /api/webhook (đã ký, có xác thực chữ ký)
   → cập nhật đơn thành PAID, gửi email link tải + Zalo
Khách quay về /success?orderCode=...
   → trang tự hỏi /api/order-status đến khi PAID → hiện nút Tải + Zalo
```

---

## 1. Cài đặt & chạy local

```bash
npm install
cp .env.example .env.local   # rồi điền các biến (xem mục 2–5)
npm run dev                  # http://localhost:3000
```

## 2. PayOS (thanh toán) — miễn phí

1. Đăng ký tại **https://my.payos.vn**, tạo **Kênh thanh toán** (liên kết tài
   khoản ngân hàng của bạn).
2. Vào kênh → mục **API**, lấy 3 giá trị, điền vào `.env.local`:
   - `PAYOS_CLIENT_ID`
   - `PAYOS_API_KEY`
   - `PAYOS_CHECKSUM_KEY`
3. Khai báo **Webhook URL** (sau khi deploy, mục 6):
   `https://<tên-app>.vercel.app/api/webhook?token=<WEBHOOK_TOKEN>`
   Bấm **Kiểm tra** — PayOS gửi ping thử, hệ thống trả 200 là hợp lệ.

## 3. Google Sheets (lưu đơn hàng) — miễn phí

1. Tạo một Google Sheet trống. Copy **SHEET_ID** trong URL
   (`docs.google.com/spreadsheets/d/`**`SHEET_ID`**`/edit`) → `GOOGLE_SHEET_ID`.
   (Sheet/tab "Orders" và dòng tiêu đề sẽ được tạo tự động ở lần ghi đầu.)
2. Vào **Google Cloud Console** → tạo project → **APIs & Services**:
   - Bật **Google Sheets API**.
   - **Credentials → Create credentials → Service account** → tạo xong vào
     service account → **Keys → Add key → JSON** (tải file về).
3. Mở file JSON, lấy:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key`  → `GOOGLE_PRIVATE_KEY` (dán cả `-----BEGIN…END-----`, giữ
     nguyên các `\n`, bọc trong dấu `"`).
4. **Chia sẻ Google Sheet** (nút Share) cho địa chỉ `client_email` đó, quyền
   **Editor**. (Quan trọng — thiếu bước này sẽ lỗi 403.)

## 4. Email Gmail (gửi link tải) — miễn phí, tuỳ chọn

1. Bật **Xác minh 2 bước** cho tài khoản Gmail.
2. Tạo **App password** (https://myaccount.google.com/apppasswords) — chuỗi 16
   ký tự.
3. Điền: `SMTP_USER` = email Gmail, `SMTP_PASS` = app password.

> Bỏ trống `SMTP_USER`/`SMTP_PASS` thì hệ thống **bỏ qua gửi email** — khách vẫn
> nhận link tải ngay trên trang `/success`.

## 5. Giá, khuyến mãi & nội dung sản phẩm

Các giá trị này chỉ là **mặc định lần đầu**. Sau khi seed, chúng nằm trong tab
**`Settings`** của Google Sheet và **sửa được ở trang `/admin`** (không cần deploy lại).

| Biến | Ý nghĩa |
|---|---|
| `PRODUCT_NAME` | Tên sản phẩm |
| `BASE_PRICE` | Giá gốc (VND), vd `499000` |
| `PROMO_PRICE` | Giá khuyến mãi (VND), vd `249000`. Phải nhỏ hơn `BASE_PRICE` thì mới hiện giảm giá |
| `PROMO_DAYS` | Số ngày khuyến mãi kể từ lần seed (dùng khi `PROMO_ENDS_AT` trống), vd `7` |
| `PROMO_ENDS_AT` | Mốc kết thúc cụ thể (ISO). Hết mốc này giá tự về `BASE_PRICE` |
| `DOWNLOAD_URL` | Link `.exe` trên GitHub Releases (đổi khi ra bản mới) |
| `ZALO_GROUP_URL` | Link mời nhóm Zalo |
| `ADMIN_PASSWORD` | Mật khẩu vào trang `/admin`. **Trống = tắt trang admin** |
| `WEBHOOK_TOKEN` | Chuỗi ngẫu nhiên bảo vệ webhook (thêm vào URL webhook ở PayOS) |
| `NEXT_PUBLIC_SITE_URL` | URL site (local `http://localhost:3000`, prod là domain Vercel) |

### Cách giảm giá hoạt động
- Khi `now < PROMO_ENDS_AT` và `PROMO_PRICE < BASE_PRICE`: trang chủ hiện giá khuyến
  mãi, gạch ngang giá gốc, kèm badge **−X%** và đồng hồ đếm ngược.
- Hết hạn: giá **tự động** quay về `BASE_PRICE`, không cần làm gì.
- Giá khách trả luôn được tính lại ở server (không sửa được từ trình duyệt).

### Trang quản trị `/admin` (sửa về sau)
Vào `https://<domain>/admin`, nhập `ADMIN_PASSWORD`. Tại đây bạn có thể:
- Sửa **giá gốc / giá khuyến mãi / hạn khuyến mãi**, tên sản phẩm, link tải, link Zalo.
- Bấm **Lưu** → áp dụng cho khách trong ~30 giây, **không cần deploy lại**.
- Xem nhanh **số đơn, doanh thu, đơn gần đây**.

> Muốn đổi giá mà không mở web? Sửa trực tiếp ô tương ứng trong tab `Settings` của
> Google Sheet cũng được — kết quả như nhau.

---

## 6. Deploy lên Vercel — miễn phí

1. Push thư mục này lên một repo GitHub (vd `vietdub-site`).
2. Vào **https://vercel.com** → **Add New → Project** → chọn repo → **Deploy**.
3. **Project Settings → Environment Variables**: thêm **tất cả** biến trong
   `.env.example` với giá trị thật (đặc biệt đổi `NEXT_PUBLIC_SITE_URL` thành
   domain Vercel, vd `https://vietdub.vercel.app`).
4. **Redeploy** để biến môi trường có hiệu lực.
5. Quay lại PayOS, đặt **Webhook URL** trỏ về `…/api/webhook?token=…` (mục 2.3).

Xong. Mỗi lần ra bản VietDub mới: chỉ cần sửa `DOWNLOAD_URL` (hoặc để
`releases/latest/...` thì không cần đổi gì).

---

## Lưu ý bảo mật

- **Không commit** `.env.local` hay file JSON service account (đã có trong
  `.gitignore`).
- File cài đặt nằm trên repo public nên đây là mô hình **tin tưởng**
  (honor-system): ai có link đều tải được. Nếu sau này cần chống sao chép, phải
  thêm license key vào app VietDub (việc riêng, lớn hơn).
