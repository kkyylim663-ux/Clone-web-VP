'use client'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'

export default function DownloadBar() {
  const { t } = useLanguage()
  const { downloadBar, setDownloadBar } = useLayout()
  if (!downloadBar) return null

  return (
    <div className="bar">
      <button aria-label="close" onClick={() => setDownloadBar(false)}>✕</button>
      <span>{t('base.shell.downloadText')}</span>
      <a href="#" onClick={(e) => e.preventDefault()}>{t('base.shell.download')}</a>

      <style jsx>{`
        .bar { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #1d1f23; font-size: 13px; }
        .bar button { background: none; border: 0; color: var(--vp-muted); cursor: pointer; }
        .bar span { flex: 1; }
        .bar a { padding: 5px 12px; border-radius: 999px; background: var(--vp-grad); color: var(--vp-on-primary); text-decoration: none; font-weight: 700; }
        @media (min-width: 768px) { .bar { display: none; } }
      `}</style>
    </div>
  )
}
