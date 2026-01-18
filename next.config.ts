import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // 프로덕션 빌드 시 정적 export
  ...(isProd && {
    output: 'export',
  }),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // 프로덕션 빌드 시 API routes 제외
  ...(isProd && {
    experimental: {
      // API routes를 빌드에서 제외하기 위한 설정
    },
  }),
};

export default nextConfig;
