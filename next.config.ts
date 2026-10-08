import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ['10.25.9.242', 'localhost:3000'],
  // Pin the workspace root to this app. A stray package-lock.json in the parent
  // directory otherwise makes Turbopack infer the parent as root, which breaks
  // module resolution for Next's built-in client components.
  turbopack: {
    root: path.resolve(__dirname),
    // One Yjs in the browser bundle. @hocuspocus/provider and @tiptap/y-tiptap resolve its CJS
    // build while the app imports the ESM one, so two copies loaded ("Yjs was already imported")
    // and Yjs's instanceof checks failed between them — live edits stopped syncing and editors
    // could come up blank (BUG-1042/1046/1018/1011).
    resolveAlias: {
      yjs: { browser: "./node_modules/yjs/dist/yjs.mjs" },
    },
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
        // Review notifications sent before the backend link fix point here (BUG-1075/1076).
        source: '/studio/workshop/:id/edit',
        destination: '/studio/content/event/:id?tab=publishing',
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
