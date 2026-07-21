import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ];
  },
};

export default nextConfig;
