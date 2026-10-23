'use client'
// 中 / EN 切换：两个并排小键，点哪个就切到哪种语言；当前语言高亮。
import { useLanguage } from '@/context/LanguageContext'

export default function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage()
  const pick = (e: React.MouseEvent, l: 'zh' | 'en') => { e.stopPropagation(); setLang(l) }
  return (
    <span className={`lt ${className ?? ''}`} role="group" aria-label="language">
      <button type="button" className={lang === 'zh' ? 'on' : undefined} aria-pressed={lang === 'zh'} onClick={(e) => pick(e, 'zh')}>中</button>
      <button type="button" className={lang === 'en' ? 'on' : undefined} aria-pressed={lang === 'en'} onClick={(e) => pick(e, 'en')}>EN</button>
      <style jsx>{`
        .lt { flex: none; display: inline-flex; padding: 2px; border-radius: 999px; background: rgba(255, 255, 255, .1); box-shadow: inset 0 1px 3px rgba(0, 0, 0, .35); }
        .lt button { min-width: 32px; height: 24px; padding: 0 8px; border: 0; border-radius: 999px; background: transparent; color: #9aa0ac; font-family: inherit; font-size: 12px; font-weight: 800; letter-spacing: .3px; cursor: pointer; transition: background .2s ease, color .2s ease; }
        .lt button.on { background: var(--vp-grad); color: var(--vp-on-primary); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .5), 0 1px 4px rgba(0, 0, 0, .35); }
      `}</style>
    </span>
  )
}
