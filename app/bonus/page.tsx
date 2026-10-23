'use client'
// 奖金（对应 vp-web/app/pages/bonus/index.vue）。列表取自 post('/api/web/promo/bonusList')，按 section 分 A/B 两组。
// 奖金卡 / 领取 → 未登录 guard('bonus') → /login?page=bonus&redirect=/bonus（来源：文档 handlers-static §4、§6）；登录后 → /bonus/details（来源：文档 handlers-static §4 BONUS_DETAILS_PAGE）。
// ?state=: 空 = 跟随登录态 | guest 访客 | claimed 已领取 | expired 已过期 | empty 空态 | loading 加载中
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useGate } from '@/lib/useGate'
import type { BonusItem } from '@/lib/mock/promo'
import { usePromoData } from '@/components/promo/usePromoData'
import { cx, fmtStr } from '@/components/promo/util'
import SkImg from '@/components/ui/SkImg'
import SkBox from '@/components/ui/SkBox'
import SkStatus from '@/components/shared/SkStatus'
import { pickLang } from '@/lib/pickLang'

// 首存分阶段奖励的占位展示（桌面）：第几次存款 + 奖励比例
const STEP_NO = ['1st', '2nd', '3rd', '4th', '5th']
const STEP_PCT = ['+50%', '+60%', '+70%', '+50%', '+50%']

// 桌面顶部轮播：背景交叉淡入，文案/按钮/配图稍后从右侧滑入（节奏参照参考站：背景 .68s，文案 .52s 延迟 .15s，按钮 .2s，配图 .62s）
const HERO = [
  { bg: 'linear-gradient(115deg, #0d2b2e 0%, #14524d 55%, #3fbf9a 100%)', img: '/assets/bonus/ico-1.webp', to: '/freeSpin' },
  { bg: 'linear-gradient(115deg, #10261f 0%, #1f6b45 55%, #86e0a0 100%)', img: '/assets/bonus/ico-2.webp', to: '/promotion' },
  { bg: 'linear-gradient(115deg, #172a3a 0%, #1f5f7a 55%, #6fd6d6 100%)', img: '/assets/bonus/ico-6.webp', to: '/promotion' }
]
const HERO_MS = 8000

export default function Page() {
  return <Suspense fallback={null}><BonusPage /></Suspense>
}

function BonusPage() {
  const sp = useSearchParams()
  const st = sp.get('state') ?? ''
  const { lang, t } = useLanguage()
  const { loggedIn } = useAuth()
  const { guard, go } = useGate()
  const { data, error, reload } = usePromoData<{ items: BonusItem[] }>('/api/web/promo/bonusList')

  // 访客也能看到奖金列表（来源：parity-next.md /bonus @375：参考站未登录仍显示 Play 按钮）；只有 ?state=guest 演示访客空态。
  // 访客点 Play：openBonus 的 guard 会跳 /login?page=bonus&redirect=/bonus（来源：parity-next.md；同 docs/nav-map）。
  const guest = st === 'guest'
  const done = st === 'claimed' || st === 'expired'
  const ctaText = (status: BonusItem['status']) => {
    if (st === 'expired' || status === 'expired') return t('bonus.expired')
    if (st === 'claimed' || status === 'claimed') return t('bonus.claimed')
    return t('bonus.claim')
  }
  const isDone = (status: BonusItem['status']) => done || status !== 'claimable'
  const openBonus = () => guard('bonus', () => go('/bonus/details'), { redirect: '/bonus' })

  const items = data?.items ?? []
  const loading = st === 'loading' || (data === null && !error)
  const secA = items.filter((i) => i.section === 'A')
  const secB = items.filter((i) => i.section === 'B')

  const [slide, setSlide] = useState(0)
  useEffect(() => {
    const id = window.setTimeout(() => setSlide((s) => (s + 1) % HERO.length), HERO_MS)
    return () => window.clearTimeout(id)
  }, [slide])

  const row = (i: BonusItem) => {
    const tx = pickLang(i.translations, lang)
    const d = isDone(i.status)
    return (
      <div key={i.id} className={cx('bn-item', i.variant === 'single' && 'bn-item--single', i.variant === 'vip' && 'bn-item--vip', i.variant === 'refer' && 'bn-item--refer', d && 'bn-item--done')} onClick={openBonus}>
        <SkImg src={i.icon} w={56} h={56} radius={8} />
        <div className="bn-txt"><b>{tx?.title ?? ''}</b><small>{tx?.desc ?? ''}</small></div>
        <span className={cx('bn-cta', !d && 'mo-pulse')} role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); openBonus() }}>{ctaText(i.status)}</span>
        <i className="bn-i" aria-hidden="true">i</i>
      </div>
    )
  }

  return (
    <div className="bn">
      {/* 顶部两个按钮行（外壳提供 logo 与钱包） */}
      <div className="bn-tabs" aria-hidden="true">
        <span className="bn-h">{t('bonus.title')}</span>
        <span className="bn-pill bn-pill--a">{t('bonus.tabA')}</span>
        <span className="bn-pill bn-pill--b">{t('bonus.tabB')}</span>
      </div>

      {/* 网页端横幅（参考站 /bonus @1280 的促销卡）→ /freeSpin（来源：parity-next.md /bonus @1280：Increasing bonus → /freeSpin）；手机端参考站无此去向，不跳转 */}
      <div className="bn-banner" onClick={() => { if (window.matchMedia('(min-width: 768px)').matches) go('/freeSpin') }} style={{ cursor: 'pointer' }}>
        <SkImg src="/assets/bonus/banner.webp" ratio="375 / 136" radius={0} label={t('bonus.banner')} />
        <span className="bn-dots"><i className="on" /><i /><i /></span>
      </div>

      <section className="bn-hero" aria-roledescription="carousel">
        {HERO.map((h, n) => <div key={`bg${n}`} className={cx('bh-bg', slide === n && 'on')} style={{ background: h.bg }} />)}
        {HERO.map((h, n) => (
          <div key={`c${n}`} className={cx('bh-c', slide === n && 'on')} aria-hidden={slide !== n}>
            <div className="bh-t">
              <span className="bh-tag">{t('bonus.tag')}</span>
              <h2>{t(`bonus.s${n + 1}`)}</h2>
            </div>
            <button type="button" className="bh-b" tabIndex={slide === n ? 0 : -1} onClick={() => go(h.to)}>{t('bonus.learn')}</button>
          </div>
        ))}
        <div className="bh-clip">
          {HERO.map((h, n) => <img key={`v${n}`} className={cx('bh-v', slide === n && 'on')} src={h.img} alt="" />)}
        </div>
        <div className="bh-arr">
          <button type="button" aria-label={t('bonus.prev')} onClick={() => setSlide((s) => (s + HERO.length - 1) % HERO.length)}>‹</button>
          <button type="button" aria-label={t('bonus.next')} onClick={() => setSlide((s) => (s + 1) % HERO.length)}>›</button>
        </div>
        <div className="bh-dots">
          {HERO.map((_, n) => <button key={n} type="button" aria-label={`${n + 1}`} className={slide === n ? 'on' : ''} onClick={() => setSlide(n)} />)}
        </div>
      </section>

      <div className="bn-panel">
        {guest ? <SkStatus kind="empty" title={t('bonus.guestTitle')} hint={t('bonus.guestHint')} h={240} /> : null}
        {!guest && loading ? [0, 1, 2, 3, 4].map((n) => <SkBox key={n} state={t('status.loading')} h={68} />) : null}
        {!guest && !loading && error ? <SkStatus kind="error" h={240} onRetry={reload} /> : null}
        {!guest && !loading && !error && (st === 'empty' || items.length === 0) ? <SkStatus kind="empty" title={t('bonus.emptyTitle')} hint={t('bonus.emptyHint')} h={240} /> : null}

        {!guest && !loading && !error && st !== 'empty' && items.length > 0 ? (
          <>
            <div className="bn-sec"><span className="bn-bar" />{t('bonus.secA')}</div>
            {secA.map((i) => i.variant === 'deposit' ? (
              <div key={i.id} className={cx('bn-deposit', isDone(i.status) && 'bn-deposit--done')}>
                <i className="bn-i" aria-hidden="true">i</i>
                <div className="bn-row">
                  <SkImg src="/assets/bonus/ico-1.webp" className="bn-dico" w={64} h={64} radius={8} label="" />
                  <div className="bn-txt"><b>{pickLang(i.translations, lang)?.title ?? ''}</b><small>{pickLang(i.translations, lang)?.desc ?? ''}</small></div>
                  <span className={cx('bn-cta', !isDone(i.status) && 'mo-pulse')} role="button" tabIndex={0} onClick={openBonus}>{ctaText(i.status)}</span>
                </div>
                <div className="bn-steps">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <div key={n} className="bn-st">
                      <SkImg src="/assets/promotion/step-chest.webp" w={59} h={59} round />
                      <em>{STEP_NO[n]}</em><b>{STEP_PCT[n]}</b>
                    </div>
                  ))}
                </div>
              </div>
            ) : row(i))}

            <div className="bn-sec bn-sec--b"><span className="bn-bar" />{t('bonus.secB')}</div>
            <div className="bn-grid">{secB.map(row)}</div>
          </>
        ) : null}
      </div>

      <style jsx global>{`
        .bn { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; padding-bottom: 80px; box-sizing: border-box; }

        /* ---- 移动端 375 ---- */
        .bn-h, .bn-i, .bn-dico, .bn-st em, .bn-st b { display: none; }
        .bn-tabs { display: flex; justify-content: flex-end; gap: 8px; height: 33px; padding: 5px 12px 0; box-sizing: border-box; }
        .bn-pill { height: 28px; line-height: 28px; border-radius: 8px; background: #2a2d33; color: #c4c8d0; font-size: 12px; text-align: center; }
        .bn-pill--a { width: 86px; }
        .bn-pill--b { width: 95px; }
        .bn-banner { position: relative; margin-top: 5px; height: 136px; overflow: hidden; }
        .bn-hero { display: none; }
        @media (max-width: 767px) { .bn .bn-steps { grid-template-columns: repeat(5, minmax(0, 1fr)); } .bn .bn-st .sk-img { width: 100% !important; height: auto !important; aspect-ratio: 1; } }
        .bn-dots { position: absolute; left: 50%; bottom: 6px; transform: translateX(-50%); display: flex; gap: 4px; }
        .bn-dots i { width: 6px; height: 6px; border-radius: 50%; background: #4a4e57; }
        .bn-dots i.on { width: 12px; border-radius: 3px; background: var(--vp-primary); }

        .bn-panel { position: relative; margin-top: -12px; padding: 8px 12px 16px; box-sizing: border-box; border-radius: 12px 12px 0 0; background: #202229; min-height: 400px; }
        .bn-sec { display: flex; align-items: center; gap: 8px; height: 38px; color: #c4c8d0; font-size: 14px; font-weight: 600; }
        .bn-sec--b { margin-top: 8px; }
        .bn-bar { width: 3px; height: 14px; border-radius: 2px; background: var(--vp-primary); }

        .bn-deposit { height: 137px; box-sizing: border-box; padding: 12px; border-radius: 10px; background: #2a2d33; }
        .bn-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; height: 30px; margin-top: 6px; }
        .bn-steps { display: grid; grid-template-columns: repeat(5, 59px); gap: 8px; margin-top: 18px; }

        .bn-item { display: flex; align-items: center; gap: 8px; height: 68px; box-sizing: border-box; padding: 6px 16px 6px 4px; margin-top: 8px; border-radius: 10px; background: #2a2d33; cursor: pointer; }
        .bn-item--single { height: 69px; }
        .bn-txt { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
        .bn-txt b { font-size: 14px; font-weight: 600; color: #fff; }
        .bn-txt small { font-size: 12px; color: #8d8d92; }

        .bn-cta { flex: none; width: 88px; height: 30px; line-height: 30px; border-radius: 999px; text-align: center; font-size: 13px; font-weight: 500; background: var(--vp-grad); color: var(--vp-on-primary); cursor: pointer; }
        .bn-deposit--done .bn-cta, .bn-item--done .bn-cta { background: #3a3d44; color: #8d8d92; }
        .bn-item--done { opacity: 0.7; }

        /* ---- 网页端 ≥768：内容区 968（推断，见规格文档） ---- */
        @media (min-width: 768px) {
          .bn { background: transparent; max-width: 1600px; margin: 0 auto; padding: 20px 0 32px; }
          .bn-tabs { padding: 0 0 20px; height: auto; align-items: center; justify-content: space-between; }
          .bn-h { display: block; font-size: 22px; font-weight: 700; margin-right: auto; }
          .bn-pill { background: rgba(255, 255, 255, 0.1); }
          .bn-banner { display: none; }
          .bn-hero { display: block; position: relative; height: 206px; border-radius: 24px; overflow: hidden; background: #1a1a21; }
          .bh-bg { position: absolute; inset: 0; opacity: 0; transition: opacity .68s ease-out; }
          .bh-bg.on { opacity: 1; }
          .bh-c { position: absolute; inset: 0; padding: 24px; box-sizing: border-box; pointer-events: none; z-index: 2; }
          .bh-c.on { pointer-events: auto; }
          .bh-t, .bh-b, .bh-v { opacity: 0; transform: translateX(34px); transition: opacity .42s cubic-bezier(.55, 0, 1, .45), transform .42s cubic-bezier(.55, 0, 1, .45); }
          .bh-c.on .bh-t { opacity: 1; transform: none; transition: opacity .52s ease-out .15s, transform .52s ease-out .15s; }
          .bh-c.on .bh-b { opacity: 1; transform: none; transition: opacity .52s ease-out .2s, transform .52s ease-out .2s; }
          .bh-t { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; max-width: 360px; }
          .bh-tag { padding: 4px 12px; border-radius: 8px; background: rgba(255, 255, 255, .18); font-size: 13px; font-weight: 700; }
          .bh-t h2 { margin: 0; font-size: 24px; line-height: 30px; font-weight: 700; }
          .bh-b { position: absolute; left: 24px; top: 138px; width: 158px; height: 36px; border: 0; border-radius: 12px; background: #fff; color: #111; font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; }
          .bh-clip { position: absolute; inset: 0; overflow: hidden; border-radius: 24px; pointer-events: none; z-index: 1; }
          .bh-v { position: absolute; right: 96px; bottom: 16px; height: 170px; width: auto; filter: drop-shadow(0 12px 24px rgba(0, 0, 0, .35)); transition: opacity .42s cubic-bezier(.55, 0, 1, .45), transform .42s cubic-bezier(.55, 0, 1, .45); }
          .bh-v.on { opacity: 1; transform: none; transition: opacity .62s cubic-bezier(.16, 1, .3, 1), transform .62s cubic-bezier(.16, 1, .3, 1); }
          .bh-arr { position: absolute; right: 12px; bottom: 12px; z-index: 3; display: flex; gap: 4px; padding: 4px; border-radius: 10px; background: rgba(0, 0, 0, .4); }
          .bh-arr button { width: 32px; height: 32px; border: 0; border-radius: 8px; background: rgba(255, 255, 255, .12); color: #fff; font-size: 20px; line-height: 1; cursor: pointer; }
          .bh-arr button:hover { background: rgba(255, 255, 255, .24); }
          .bh-dots { position: absolute; left: 50%; bottom: 12px; z-index: 3; transform: translateX(-50%); display: flex; gap: 4px; padding: 8px 12px; }
          .bh-dots button { width: 8px; height: 8px; padding: 0; border: 0; border-radius: 999px; background: rgba(255, 255, 255, .2); cursor: pointer; transition: all .3s ease-out; }
          .bh-dots button.on { width: 24px; background: rgba(255, 255, 255, .6); }
          .bn-tabs { margin-bottom: 0; }
          .bn-hero { margin-bottom: 4px; }
          @media (prefers-reduced-motion: reduce) { .bh-bg, .bh-t, .bh-b, .bh-v { transition: none !important; } }
          .bn-panel { margin-top: 0; padding: 0; border-radius: 0; background: transparent; }
          .bn-sec { height: 48px; margin-top: 16px; font-size: 18px; font-weight: 700; color: #fff; }
          .bn-bar { display: none; }
          .bn-i { display: flex; position: absolute; top: 12px; right: 14px; width: 16px; height: 16px; align-items: center; justify-content: center; border-radius: 50%; background: #6b6e78; color: #1a1a21; font-size: 11px; font-weight: 800; font-style: normal; line-height: 1; }
          .bn-sec { margin-top: 24px; }
          /* 首存：暖棕渐变宽卡 = 图标 + 文案 + 描边按钮 + 5 个阶段小卡 */
          .bn-deposit { position: relative; display: flex; align-items: center; gap: 28px; height: 120px; padding: 0 40px 0 28px; box-sizing: border-box; border-radius: 20px; background: linear-gradient(100deg, #3b3029 0%, #2c2926 45%, #25262d 100%); border: 1px solid #4a4038; }
          /* 首存行宽 = 半宽卡内容宽，使两个“领取”按钮左右上下对齐 */
          .bn-row { flex: 0 0 calc(50% - 31px); min-width: 0; margin-top: 0; height: auto; gap: 20px; justify-content: flex-start; }
          .bn-row .bn-txt { flex: 1; }
          .bn-row .bn-dico, .bn-item > .sk-img { width: 64px !important; height: 64px !important; flex: none; }
          .bn-txt b { font-size: 18px; font-weight: 700; }
          .bn-txt small { font-size: 13px; color: #a9a39c; }
          .bn-st b { font-size: 13px; }
          .bn-cta { width: 158px; flex: none; height: 48px; line-height: 46px; box-sizing: border-box; font-size: 15px; font-weight: 700; background: rgba(5, 242, 106, .10); border: 1px solid rgba(5, 242, 106, .35); color: #3df585; }
          .bn-st em, .bn-st b, .bn-i, .bn-dico { display: block; }
          .bn-i { display: flex; }
          .bn-steps { flex: 1 1 0; min-width: 0; grid-template-columns: repeat(5, 1fr); gap: 18px; margin-top: 0; }
          .bn-st { position: relative; height: 88px; overflow: hidden; border-radius: 8px; border: 1px solid #4c4b57; background: linear-gradient(180deg, #4a4954, #35343c); }
          .bn-st .sk-img { position: absolute; left: 50%; top: 6px; width: 46px !important; height: 46px !important; margin-left: -23px; border-radius: 0 !important; background: none !important; }
          .bn-st em { position: absolute; top: 0; right: 0; padding: 0 9px; height: 18px; border-radius: 0 0 0 8px; background: linear-gradient(90deg, #d4239f, #7c3aed); color: #fff; font-size: 11px; font-weight: 700; font-style: normal; line-height: 18px; }
          .bn-st b { position: absolute; left: 0; right: 0; bottom: 0; height: 28px; background: #4a4a54; color: #f3dfcc; font-size: 15px; font-weight: 600; line-height: 28px; text-align: center; }
          .bn-deposit--done .bn-cta, .bn-item--done .bn-cta { background: #3a3d44; border-color: transparent; color: #8d8d92; }
          /* 每日返水等单行卡：半宽，紫灰渐变 */
          .bn-item { position: relative; margin-top: 16px; }
          .bn-panel > .bn-item--single { width: calc(50% - 8px); height: 120px; padding: 0 28px; gap: 20px; border-radius: 20px; background: linear-gradient(100deg, #322f43 0%, #28283a 55%, #232430 100%); border: 1px solid #3f3d56; }
          .bn-panel > .bn-item--single .bn-txt { flex: 1; }
          /* 免费奖金：图标探出卡片顶边，底部一条深色操作区 */
          .bn-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; padding-top: 16px; }
          .bn-grid .bn-item { flex-direction: column; justify-content: flex-start; height: auto; min-height: 232px; margin-top: 0; padding: 56px 16px 16px; text-align: center; border-radius: 20px; border: 1px solid #2f3733; background: linear-gradient(to top, #17181d 82px, #202a26 82px); gap: 0; }
          .bn-grid .bn-item > .sk-img { position: absolute; left: 50%; top: -18px; margin-left: -32px; }
          .bn-grid .bn-txt { flex: none; align-items: center; gap: 6px; padding-bottom: 28px; }
          .bn-grid .bn-txt b { font-size: 17px; }
          .bn-grid .bn-cta { width: 100%; margin-top: auto; }
          .bn-grid .bn-item:first-child .bn-cta { background: var(--vp-grad); border: 0; color: var(--vp-on-primary); box-shadow: 0 6px 18px rgba(53, 213, 109, .35); }
          .bn-grid .bn-item--done .bn-cta { background: #3a3d44; box-shadow: none; color: #8d8d92; }
        }
      `}</style>
    </div>
  )
}
