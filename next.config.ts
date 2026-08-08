import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.25.9.242', 'localhost:3000'],
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
        source: '/login',
        destination: '/sign?mode=login',
        permanent: false,
      },
      {
        source: '/signup',
        destination: '/sign?mode=signup',
        permanent: false,
      },
      {
        source: '/register',
        destination: '/sign?mode=signup',
        permanent: false,
      },
      {
        source: '/dashboard/admin/channels',
        destination: '/arc-console/channels',
        permanent: true,
      },
      {
        source: '/dashboard/admin/settings',
        destination: '/console/iam',
        permanent: true,
      },
      {
        source: '/console/settings',
        destination: '/console/iam',
        permanent: true,
      },
      {
        source: '/arc-console/settings',
        destination: '/console/iam',
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
