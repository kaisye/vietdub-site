/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // googleapis/nodemailer/@payos/node are server-only; keep them external so
    // Next does not try to bundle their native/optional deps for the client.
    serverComponentsExternalPackages: ["googleapis", "nodemailer", "@payos/node"],
  },
};

export default nextConfig;
