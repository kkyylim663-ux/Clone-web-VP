'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useGate } from '@/lib/useGate'
import { type Lang } from '@/config/languages'
import SkImg from '@/components/ui/SkImg'
import SkBox from '@/components/ui/SkBox'

// 语言页（bare 外壳）：中文 / English 两项，点选即时切换（不刷新、网址不变，cookie vp_lang 记忆）。
// 去向：‹ = useGate().back。来源：骨架（?lang= 选中、?state=loading 加载中）；切换 = 实测行为（语言即时生效，见 docs/language-contract.md）。
const OPTIONS: { k: Lang, n: string }[] = [
  { k: 'zh', n: '中文' },
  { k: 'en', n: 'English' }
]

export default function LanguagePage() {
  return <Suspense fallback={null}><Inner /></Suspense>
}

function Inner() {
  const { lang, setLang, t } = useLanguage()
  const { back } = useGate()
  const sp = useSearchParams()
  const loading = sp.get('state') === 'loading'
  return (
    <div className="lg">
      <header className="bar">
        <button type="button" className="back" aria-label={t('auth.back')} onClick={back}>‹</button>
        <span className="title">{t('auth.lang.title')}</span>
      </header>

      <div className="list">
        {loading ? (
          OPTIONS.map((o) => <SkBox key={o.k} state={t('auth.verify.loading')} className="language_pg__skel" />)
        ) : (
          OPTIONS.map((o) => (
            <button key={o.k} type="button" className={`row${lang === o.k ? ' on' : ''}`} aria-pressed={lang === o.k} onClick={() => setLang(o.k)}>
              <i className="lgb" aria-hidden="true">{o.k === 'zh' ? '中' : o.k.toUpperCase().slice(0, 2)}</i>
              <span className="name">{o.n}</span>
              <span className="check" aria-hidden="true">{lang === o.k ? '✓' : ''}</span>
            </button>
          ))
        )}
      </div>

      <style jsx>{`
        .lg { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; }
        .lgb { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #2f9e6b, #1f6f9e); color: #fff; font-style: normal; font-size: 11px; font-weight: 800; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .25); }
        .bar { display: flex; align-items: center; gap: 12px; height: 55px; padding: 0 12px; box-sizing: border-box; }
        .back { width: 24px; padding: 0; border: 0; background: none; color: #fff; font-size: 26px; line-height: 1; cursor: pointer; }
        .title { font-size: 17px; font-weight: 600; }
        .list { display: flex; flex-direction: column; gap: 8px; padding: 12px; box-sizing: border-box; }
        .row { display: flex; align-items: center; gap: 12px; height: 56px; width: 100%; padding: 0 16px; box-sizing: border-box; border-radius: 12px; border: 1px solid transparent; background: #26262c; color: #fff; font: inherit; text-align: left; cursor: pointer; }
        .row.on { border-color: var(--vp-primary); }
        .name { flex: 1; font-size: 15px; }
        .check { color: var(--vp-primary); font-size: 16px; font-weight: 700; }
        :global(.language_pg__skel) { width: 100%; height: 56px; }
        @media (min-width: 768px) {
          .list { max-width: 480px; margin: 40px auto 0; }
        }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
