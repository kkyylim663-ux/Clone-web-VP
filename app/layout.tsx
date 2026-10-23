import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { Figtree } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import StyledJsxRegistry from './registry'
import Shell from '@/components/layout/Shell'
import { LANG_COOKIE, PRIMARY_LANG, SESSION_COOKIE, isLang } from '@/config/languages'

// 正文字体：Figtree（最接近原站 proxima-nova 的免费字体），构建时自托管；中文走系统 PingFang SC / Noto Sans SC
const figtree = Figtree({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], display: 'swap', variable: '--font-figtree' })

export const metadata: Metadata = { title: 'BRAND', description: 'BRAND' }
export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies()
  const c = jar.get(LANG_COOKIE)?.value
  const lang = isLang(c) ? c : PRIMARY_LANG
  const session = !!jar.get(SESSION_COOKIE)?.value
  return (
    <html lang={lang} className={figtree.variable}>
      <body>
        <StyledJsxRegistry>
          <Providers lang={lang} session={session}>
            <Shell>{children}</Shell>
          </Providers>
        </StyledJsxRegistry>
      </body>
    </html>
  )
}
