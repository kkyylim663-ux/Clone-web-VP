'use client'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

// 404 页（App Router 的 not-found，所有未匹配路径都走这里，HTTP 状态自动为 404）。
// 语言跟随当前语言（cookie vp_lang）；中文版与英文版结构相同，只换文字。
// 去向：按钮「返回首页」→ `/`。来源：骨架（Sk404Panel）+ 需求。
export default function NotFound() {
  const { lang, t } = useLanguage()
  return (
    <section className={`nf nf--${lang}`}>
      <span className="nf-lang">{lang === 'zh' ? '中文版' : 'EN'}</span>
      <div className="nf-code">404</div>
      <p className="nf-title">{t('auth.nf.title')}</p>
      <p className="nf-desc">{t('auth.nf.desc')}</p>
      <Link className="not_found__nf-btn" href="/">{t('auth.nf.btn')}</Link>

      <style jsx>{`
        .nf { display: flex; flex-direction: column; align-items: center; gap: 12px; min-height: 100%; box-sizing: border-box;
          padding: 96px 16px 48px; background: #1a1a21; color: #fff; text-align: center; }
        .nf-lang { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: #2a2d33; color: #8d93a0; }
        .nf--zh .nf-lang { color: #f5b942; }
        .nf-code { font-size: 72px; font-weight: 700; line-height: 1; color: var(--vp-primary); }
        .nf-title { margin: 0; font-size: 18px; font-weight: 600; }
        .nf-desc { margin: 0; font-size: 13px; color: #8d93a0; }
        :global(.not_found__nf-btn) { margin-top: 8px; height: 40px; line-height: 40px; padding: 0 24px; border-radius: 8px; background: var(--vp-grad); color: var(--vp-on-primary); font-size: 14px; font-weight: 600; text-decoration: none; }
        .nf--zh :global(.not_found__nf-btn) { min-width: 120px; }
        @media (min-width: 768px) {
          .nf { padding: 160px 32px 64px; }
          .nf-code { font-size: 120px; }
        }
      `}</style>
    </section>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
