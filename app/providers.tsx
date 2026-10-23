'use client'
import { LanguageProvider } from '@/context/LanguageContext'
import { AuthProvider } from '@/context/AuthContext'
import { LayoutProvider } from '@/context/LayoutContext'
import type { Lang } from '@/config/languages'

export default function Providers({ lang, session, children }: { lang: Lang, session: boolean, children: React.ReactNode }) {
  return (
    <LanguageProvider initial={lang}>
      <AuthProvider initialSession={session}>
        <LayoutProvider>{children}</LayoutProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}
