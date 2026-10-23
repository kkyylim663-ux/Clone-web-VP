import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next', // 打包版用 .next-prod，和开发服务器（.next）互不干扰
  devIndicators: false, // 关掉开发模式左下角的 N 徽标（会挡住界面）
  // 接口：apiBase 为空走本项目 app/api 的 mock；填 NEXT_PUBLIC_API_BASE 走真后端（TTXbo）
  async redirects() {
    // 旧的带 /zh 前缀网址 → 无前缀（语言用 cookie 记忆，见 docs/language-contract.md）
    return [
      { source: '/zh/:path*', destination: '/:path*', permanent: true },
      // 参考站前端跳转（非永久，见 docs/audit/opus-review.md §1）
      { source: '/home', destination: '/', permanent: false },
      { source: '/welcome', destination: '/', permanent: false },
      { source: '/third-login', destination: '/login', permanent: false },
      // Nuxt 文件路径写法 → 参考站真实路径（连字符）
      { source: '/jackpot/detail', destination: '/jackpot-detail', permanent: false },
      { source: '/jackpot/share', destination: '/jackpot-share', permanent: false },
      { source: '/jackpot/mybouns', destination: '/jackpot-mybouns', permanent: false },
      { source: '/redirectPay', destination: '/?jumpType=Deposit', permanent: false },
    ]
  }
}
export default nextConfig
