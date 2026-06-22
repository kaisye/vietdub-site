// Đọc file JSON service account và điền GOOGLE_SERVICE_ACCOUNT_EMAIL +
// GOOGLE_PRIVATE_KEY (định dạng đúng) vào .env.local — KHÔNG in lộ private key.
//
// Dùng:  node scripts/apply-google-key.mjs [đường-dẫn-file.json]
// Mặc định đọc:  google-service-account.json  ở thư mục gốc project.
import fs from "fs";

const jsonPath = process.argv[2] || "google-service-account.json";
const envPath = ".env.local";

if (!fs.existsSync(jsonPath)) {
  console.error(`Không thấy file: ${jsonPath}`);
  console.error("Hãy lưu file JSON service account vào thư mục project rồi chạy lại.");
  process.exit(1);
}

let j;
try {
  j = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
} catch {
  console.error("File không phải JSON hợp lệ.");
  process.exit(1);
}

if (!j.client_email || !j.private_key) {
  console.error("File JSON thiếu client_email hoặc private_key — sai loại key.");
  process.exit(1);
}

const email = String(j.client_email).trim();
// Một dòng, bọc nháy kép, các xuống dòng thật -> \n literal.
const keyOneLine = '"' + String(j.private_key).replace(/\r/g, "").replace(/\n/g, "\\n") + '"';

let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

function setVar(content, key, value) {
  const re = new RegExp("^" + key + "=.*$", "m");
  if (re.test(content)) return content.replace(re, () => `${key}=${value}`);
  return content.replace(/\s*$/, "") + `\n${key}=${value}\n`;
}

env = setVar(env, "GOOGLE_SERVICE_ACCOUNT_EMAIL", email);
env = setVar(env, "GOOGLE_PRIVATE_KEY", keyOneLine);
fs.writeFileSync(envPath, env);

console.log("Đã cập nhật .env.local:");
console.log("  GOOGLE_SERVICE_ACCOUNT_EMAIL =", email);
console.log(`  GOOGLE_PRIVATE_KEY = (đã điền, ${j.private_key.length} ký tự, ẩn vì là bí mật)`);
console.log("");
console.log("Email là service account hợp lệ:", email.includes("gserviceaccount.com"));
console.log("→ Nhớ: 1) chia sẻ Google Sheet cho email trên (quyền Editor)");
console.log("       2) khởi động lại  npm run dev");
