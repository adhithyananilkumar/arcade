import path from "path";
import type { NextConfig } from "next";

// ---- Mock-mode / auth-bypass production guard --------------------------
// Defense in depth alongside the CI check in scripts/check-mock-safety.mjs:
// this throws at build time (not just in CI) if either dev-only flag is set
// in a production build, so it's structurally impossible to ship. See
// mock/README.md.
if (
  process.env.NODE_ENV === "production" &&
  (process.env.NEXT_PUBLIC_USE_MOCKS === "true" || process.env.NEXT_PUBLIC_AUTH_BYPASS === "true")
) {
  throw new Error(
    "NEXT_PUBLIC_USE_MOCKS / NEXT_PUBLIC_AUTH_BYPASS cannot be enabled in a production build."
  );
}
// ---------------------------------------------------------------------------

const nextConfig: NextConfig = {
  // Pin the workspace root to this app. A stray package-lock.json in the parent
  // directory otherwise makes Turbopack infer the parent as root, which breaks
  // module resolution for Next's built-in client components.
  turbopack: {
    root: path.resolve(__dirname),
  },
  serverExternalPackages: ["yjs"],
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/dashboard/admin/channels',
        destination: '/arc-console/channels',
        permanent: true,
      },
      {
        source: '/dashboard/admin/settings',
        destination: '/arc-console/settings',
        permanent: true,
      },
      {
        source: '/dashboard/content/review',
        destination: '/arc-console/courses',
        permanent: true,
      },
      {
        source: '/for-creators',
        destination: '/creators',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
      {
        source: '/dashboard/:path*',
        destination: '/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
