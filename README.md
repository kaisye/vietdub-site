# VietDub — AI video dubbing & subtitling, free to run

> **Storefront:** **https://vietdub-site.vercel.app/**

**VietDub** is a desktop app (Windows & macOS) that automatically **downloads →
translates → dubs → renders** video right on your machine. Paste a YouTube,
Facebook, or Douyin link and VietDub does the rest — **no paid APIs, no GPU
required** (faster if you have one), and everything runs **locally and
privately**. **Pay once, use forever**, with free updates.

## Features

| Feature | What it does |
|---|---|
| **Multi-platform download** | Download straight from YouTube, Facebook, Douyin, and more. Source subtitles are obtained by priority: existing subtitles → **hard-sub extraction via OCR** → **speech recognition (STT)**; or load your own `.srt`. |
| **Time-aligned translation** | Automatic translation to Vietnamese that preserves per-line timing, so subtitles and speech stay in sync with the video. |
| **Edge AI & NGHI-TTS voices** | Dozens of natural Vietnamese voices (including the offline NGHI-TTS set), ready to use — no high-end hardware, no GPU, no paid API. |
| **OmniVoice voice cloning** | Clone a voice from your own sample, running on **free Google Colab** or on a local GPU; save multiple Google accounts for fast switching. |
| **Subtitle styling & presets** | Adjust font, color, outline, position, and more; **save styles to reuse instantly**; optionally **blur the original hard-sub area** to cover it before laying down the new subtitles. |
| **Speed & background audio** | Auto-fit speaking rate to the original timing; keep the background music and add sound effects when needed. |
| **Render & auto-update** | Export the finished video with **bundled FFmpeg**; the app runs locally and installs **signed, secure updates** automatically. |

## Platform & requirements

- **Windows 10/11 (x64)** and **macOS Apple Silicon (M1 or newer)**.
- The installer sets up everything it needs — **no admin rights required**.
- **No GPU** and **no paid APIs**. The backend binds only to `127.0.0.1`, so your
  video and configuration are **never sent to any server**.

## Buy a license

**https://vietdub-site.vercel.app/**

Pay once, own it forever with free updates. Payment is via **VietQR (PayOS)**:
scan the QR, the system confirms within seconds, then emails you the **download
link + Zalo support group link**.

---

# About this repo — storefront source

The section below is for **operating the storefront**: the website that sells
VietDub with **automatic payment via PayOS (VietQR)** — the customer scans the QR
and transfers, the system confirms automatically → records the order in **Google
Sheets** → sends the **download-link email** + **Zalo group link**, and shows the
link right on the thank-you page. Everything runs **free**: Vercel (web + webhook)
· Google Sheets (orders) · PayOS (payments) · GitHub Releases (installer) · Gmail
SMTP (email).

## How it works

```
Customer enters email → /api/create-payment
   → create orderCode, write a PENDING order to Google Sheets
   → create a PayOS (VietQR) link → redirect the customer to PayOS checkout
Customer transfers
   → PayOS calls /api/webhook (signed, signature-verified)
   → mark the order PAID, send the download-link + Zalo email
Customer returns to /success?orderCode=...
   → the page polls /api/order-status until PAID → shows Download + Zalo buttons
```

---

## 1. Install & run locally

```bash
npm install
cp .env.example .env.local   # then fill in the variables (see sections 2–5)
npm run dev                  # http://localhost:3000
```

## 2. PayOS (payments) — free

1. Sign up at **https://my.payos.vn** and create a **Payment Channel** (linked to
   your bank account).
2. In the channel → **API** section, get the 3 values and put them in `.env.local`:
   - `PAYOS_CLIENT_ID`
   - `PAYOS_API_KEY`
   - `PAYOS_CHECKSUM_KEY`
3. Set the **Webhook URL** (after deploying, section 6):
   `https://<app-name>.vercel.app/api/webhook?token=<WEBHOOK_TOKEN>`
   Click **Test** — PayOS sends a ping; a 200 response means it's valid.

## 3. Google Sheets (order storage) — free

1. Create an empty Google Sheet. Copy the **SHEET_ID** from the URL
   (`docs.google.com/spreadsheets/d/`**`SHEET_ID`**`/edit`) → `GOOGLE_SHEET_ID`.
   (The "Orders" tab and header row are created automatically on first write.)
2. In **Google Cloud Console** → create a project → **APIs & Services**:
   - Enable the **Google Sheets API**.
   - **Credentials → Create credentials → Service account** → once created, open
     the service account → **Keys → Add key → JSON** (download the file).
3. Open the JSON file and take:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key`  → `GOOGLE_PRIVATE_KEY` (paste the whole `-----BEGIN…END-----`,
     keep the `\n` sequences, and wrap it in `"`).
4. **Share the Google Sheet** (Share button) with that `client_email`, with
   **Editor** access. (Important — skipping this causes a 403 error.)

## 4. Gmail email (sending the download link) — free, optional

1. Enable **2-Step Verification** on the Gmail account.
2. Create an **App password** (https://myaccount.google.com/apppasswords) — a
   16-character string.
3. Fill in: `SMTP_USER` = Gmail address, `SMTP_PASS` = app password.

> Leave `SMTP_USER`/`SMTP_PASS` empty and the system **skips sending email** — the
> customer still gets the download link right on the `/success` page.

## 5. Pricing, promotions & product content

These values are only **first-run defaults**. After seeding, they live in the
**`Settings`** tab of the Google Sheet and are **editable from `/admin`** (no
redeploy needed).

| Variable | Meaning |
|---|---|
| `PRODUCT_NAME` | Product name |
| `BASE_PRICE` | Base price (VND), e.g. `499000` |
| `PROMO_PRICE` | Promo price (VND), e.g. `249000`. Must be lower than `BASE_PRICE` for a discount to show |
| `PROMO_DAYS` | Promo length in days from the seed (used when `PROMO_ENDS_AT` is empty), e.g. `7` |
| `PROMO_ENDS_AT` | A specific end timestamp (ISO). After it, the price reverts to `BASE_PRICE` |
| `DOWNLOAD_URL` | The `.exe` link on GitHub Releases (update it for each new build) |
| `ZALO_GROUP_URL` | Zalo group invite link |
| `ADMIN_PASSWORD` | Password for `/admin`. **Empty = admin page disabled** |
| `WEBHOOK_TOKEN` | A random string protecting the webhook (added to the PayOS webhook URL) |
| `NEXT_PUBLIC_SITE_URL` | Site URL (local `http://localhost:3000`, prod is the Vercel domain) |

### How the discount works
- When `now < PROMO_ENDS_AT` and `PROMO_PRICE < BASE_PRICE`: the home page shows
  the promo price, strikes through the base price, and adds a **−X%** badge plus a
  countdown.
- After expiry: the price reverts to `BASE_PRICE` **automatically**, no action needed.
- The price the customer pays is always recomputed on the server (it can't be
  tampered with from the browser).

### Admin page `/admin` (edit later)
Go to `https://<domain>/admin` and enter `ADMIN_PASSWORD`. There you can:
- Edit **base price / promo price / promo deadline**, product name, download link,
  Zalo link.
- Click **Save** → applies to customers within ~30 seconds, **no redeploy needed**.
- See a quick view of **order count, revenue, recent orders**.

> Want to change the price without opening the site? Edit the matching cell in the
> `Settings` tab of the Google Sheet directly — same result.

---

## 6. Deploy to Vercel — free

1. Push this folder to a GitHub repo (e.g. `vietdub-site`).
2. Go to **https://vercel.com** → **Add New → Project** → pick the repo → **Deploy**.
3. **Project Settings → Environment Variables**: add **all** variables from
   `.env.example` with their real values (in particular set `NEXT_PUBLIC_SITE_URL`
   to the Vercel domain, e.g. `https://vietdub.vercel.app`).
4. **Redeploy** so the environment variables take effect.
5. Back in PayOS, set the **Webhook URL** to `…/api/webhook?token=…` (section 2.3).

Done. For each new VietDub build, just update `DOWNLOAD_URL` (or point it at
`releases/latest/...` so nothing needs changing).

---

## Security notes

- **Do not commit** `.env.local` or the service-account JSON file (already in
  `.gitignore`).
- The installer lives in a public repo, so this is an **honor-system** trust model:
  anyone with the link can download it. If you later need copy protection, you'd
  add a license key to the VietDub app (a separate, larger effort).
