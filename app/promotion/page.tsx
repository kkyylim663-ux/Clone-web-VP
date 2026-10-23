'use client'
// 活动（对应 vp-web/app/pages/promotion.vue）。列表取自 post('/api/web/site/promotions')，名称与描述按语言 pickLang。
// 活动卡 → /bonus/details：推断（参考站 /promotion 卡片实测为弹窗，未对齐）。返回 → back()：来源：文档（handlers-static §3）。
// 存款按钮：来源：推断（打开右侧钱包面板，不跳转；未登录先走登录守卫）。
// 分类下拉：参考站 375 顶栏与 1280 标题行都没有该控件（来源 docs/audit/opus-review.md §2），已不渲染；
// 筛选逻辑（cat / cats / shown）保留在代码里，cat 恒为 'all'，需要时再接回 filter()。
import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import { useGate } from '@/lib/useGate'
import { pickLang } from '@/lib/pickLang'
import type { ApiPromotion } from '@/lib/types'
import { usePromoData } from '@/components/promo/usePromoData'
import IconTile from '@/components/ui/IconTile'
import SkBox from '@/components/ui/SkBox'
import SkStatus from '@/components/shared/SkStatus'
import PromoModal from '@/components/promo/PromoModal'
import { getPromoContent, promoContentKey } from '@/components/promo/promoContent'

const A = '/assets/promotion/'
const CARD_BY_CAT: Record<string, string> = { daily: 'daily-rebate', welcome: 'special', spin: 'free-spins', rescue: 'rescue', vip: 'vip', refer: 'refer' }
const CARD_ORDER = ['daily-rebate', 'free-spins', 'special', 'weekly', 'vip', 'refer']

export default function Page() {
  return <Suspense fallback={null}><PromotionPage /></Suspense>
}

// 骨架状态（?state=）：'' 默认 | loading 加载中 | empty 空态 | error 错误（只影响卡片列表，顶部横幅保留）
function PromotionPage() {
  const sp = useSearchParams()
  const st = sp.get('state') ?? ''
  const { lang, t } = useLanguage()
  const { setWalletOpen } = useLayout()
  const { back, go, guard } = useGate()
  const { data, error, reload } = usePromoData<{ list: ApiPromotion[] }>('/api/web/site/promotions')
  // 分类筛选已停用（参考站无此控件）：cat 恒为 'all'
  const [cat, setCat] = useState('all')
  const [openId, setOpenId] = useState<number | string | null>(null)
  const [bannerOpen, setBannerOpen] = useState(false)

  const list = data?.list ?? []
  const cats = useMemo(() => ['all', ...Array.from(new Set(list.map((p) => p.category)))], [list])
  const shown = cat === 'all' ? list : list.filter((p) => p.category === cat)
  const mode = st === 'loading' || st === 'error' || st === 'empty' ? st
    : data === null && !error ? 'loading'
      : error ? 'error'
        : shown.length ? 'data' : 'empty'

  const cur = list.find((p) => p.id === openId)
  const curTx = cur ? pickLang(cur.translations, lang) : null
  const closeModal = () => setOpenId(null)
  // 弹窗主按钮：未登录走登录守卫，登录后打开钱包存款面板（与页面顶部存款按钮一致）
  const curContent = cur ? getPromoContent(promoContentKey(cur.category), lang) : undefined
  const modalCta = () => { closeModal(); if (curContent?.to) go(curContent.to); else guard('wallet', () => setWalletOpen(true)) }

  // 保留但不渲染（见文件头注释）；接回时在顶栏/标题行放入即可
  const filter = (cls: string) => (
    <select className={cls} value={cat} onChange={(e) => setCat(e.target.value)} aria-label={t('promotion.filter')}>
      {cats.map((c) => <option key={c} value={c}>{c === 'all' ? t('promotion.all') : t(`promotion.cat.${c}`)}</option>)}
    </select>
  )
  void filter

  return (
    <div className="pr">
      {/* 页内顶栏：移动端 55px，只有返回 + 标题 */}
      <header className="pr-bar">
        <span className="pr-back" aria-hidden="true" onClick={back}>‹</span>
        <h1 className="pr-bar__title">{t('promotion.title')}</h1>
      </header>
      {/* 网页端标题（1280 实测 y=82 起），无右侧下拉 */}
      <div className="pr-titlerow">
        <h1 className="pr-title"><IconTile name="snowflake" size={28} round tone="mint" />{t('promotion.title')}</h1>
      </div>

      {/* 顶部横幅：移动端 258 高、网页端 167 高 */}
      <section className="pr-banner" onClick={() => setBannerOpen(true)} role="button" tabIndex={0}>
        <div className="pr-banner__bg">
          <div className="pr-t">
            <p className="pr-t1">{t('promotion.bannerA')}</p>
            <p className="pr-t2">{t('promotion.bannerB')}</p>
          </div>
          <div className="pr-steps">
            {[50, 60, 70, 50, 50].map((pct, k) => { const n = k + 1; return (
              <div key={n} className="pr-step">
                <span className="pr-step__rank">{t(`promotion.rank${n}`)}</span>
                <img className="pr-step__ico" src={A + 'step-chest.webp'} alt="" style={{ animationDelay: `${k * 0.18}s` }} />
                <span className="pr-step__cap">+{pct}%</span>
              </div>
            ) })}
          </div>
          <button type="button" className="pr-deposit" onClick={(e) => { e.stopPropagation(); guard('wallet', () => setWalletOpen(true)) }}>{t('promotion.deposit')}</button>
        </div>
      </section>

      {/* 卡片列表 */}
      <div className="pr-list">
        {mode === 'loading' ? [0, 1, 2, 3].map((n) => <SkBox key={n} state={t('status.loading')} className="promotion_pg__pr-skel" />) : null}
        {mode === 'error' ? <SkStatus kind="error" h={200} onRetry={reload} /> : null}
        {mode === 'empty' ? <SkStatus kind="empty" title={t('promotion.empty')} hint={t('promotion.emptyHint')} h={200} /> : null}
        {mode === 'data' ? shown.map((p, i) => {
          const tx = pickLang(p.translations, lang)
          return (
            <article key={p.id} className="pr-card mo-hover-card" onClick={() => setOpenId(p.id)}>
              <img className="pr-card__img" src={`${A}card-${CARD_BY_CAT[p.category] ?? CARD_ORDER[i % CARD_ORDER.length]}.webp`} alt="" />
              {/* 标题压在图片左下角（白字 16/600，最多 2 行），右下角「更多」胶囊 */}
              <div className="pr-card__ov">
                <span className="pr-card__title">{tx?.name ?? ''}</span>
                <span className="pr-more">{t('promotion.more')}</span>
              </div>
              <div className="pr-card__foot">
                <span className="pr-card__desc">{tx?.desc ?? ''}</span>
                <span className="pr-go" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2l4 4-4 4" /></svg></span>
              </div>
            </article>
          )
        }) : null}
      </div>

      <PromoModal open={bannerOpen} title={`${t('promotion.bannerA')} ${t('promotion.bannerB')}`} desc="" content={getPromoContent('first5', lang)} onClose={() => setBannerOpen(false)} onCta={() => { setBannerOpen(false); guard('wallet', () => setWalletOpen(true)) }} />
      <PromoModal open={openId !== null} title={curTx?.name ?? ''} desc={curTx?.desc ?? ''} content={curContent} onClose={closeModal} onCta={modalCta} />

      <style jsx global>{`
        .pr { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; }

        /* ---- 移动端 375 ---- */
        .pr-bar { display: flex; align-items: center; gap: 12px; height: 55px; padding: 0 12px; box-sizing: border-box; }
        .pr-back { width: 24px; font-size: 26px; line-height: 1; cursor: pointer; }
        .pr-bar__title { margin: 0; font-size: 17px; font-weight: 600; }
        .pr-titlerow { display: contents; }
        .pr-title { display: none; }

        .pr-banner { cursor: pointer; position: relative; height: 258px; margin-top: 2px; padding: 7px 12px 0; box-sizing: border-box; }
        .pr-banner__bg { display: grid; grid-template-columns: 1fr; grid-template-areas: "t" "s" "b"; row-gap: 20px; align-content: start;
          height: 243px; padding: 20px 12px 16px; box-sizing: border-box; border-radius: 8px;
          background: #1f1d33 url(/assets/promotion/first5-mobile-crop.webp) 70% center / cover no-repeat; }
        .pr-t { grid-area: t; padding-left: 15px; }
        .pr-t1 { margin: 0; color: var(--vp-text-img); text-shadow: var(--vp-text-img-shadow); font-size: 34px; line-height: 34px; font-weight: 700; }
        .pr-t2 { margin: 0; color: var(--vp-text-img); text-shadow: var(--vp-text-img-shadow); font-size: 30px; line-height: 30px; font-weight: 700; }
        .pr-steps { grid-area: s; display: flex; gap: 8px; }
        .pr-step { position: relative; width: 59px; height: 59px; border-radius: 8px; background: rgba(8, 22, 28, 0.82); border: 1px solid rgba(255, 255, 255, 0.28); box-shadow: 0 2px 10px rgba(0, 0, 0, 0.45); overflow: hidden; }
        /* 序号角标：高 14、主色底、顶部居中（参考 json 375 格子 59×59 y168） */
        .pr-step__rank { position: absolute; left: 50%; top: 4px; transform: translateX(-50%); height: 14px; line-height: 14px; padding: 0 6px; border-radius: 999px; background: var(--vp-primary); color: var(--vp-on-primary); font-size: 9px; font-weight: 600; white-space: nowrap; }
        .pr-step__ico { position: absolute; left: 50%; top: 19px; width: 24px; height: auto; transform: translateX(-50%); }
        .pr-step__ico { animation: pr-hop 1.1s ease-in-out infinite; transform-origin: 50% 100%; }
        @keyframes pr-hop { 0%, 100% { transform: translateX(-50%) translateY(0) scale(1, 1); } 30% { transform: translateX(-50%) translateY(-7px) scale(.95, 1.06); } 55% { transform: translateX(-50%) translateY(0) scale(1.08, .92); } 70% { transform: translateX(-50%) translateY(-2px) scale(1, 1); } }
        @media (prefers-reduced-motion: reduce) { .pr-step__ico { animation: none; } }
        .pr-step__cap { position: absolute; left: 0; right: 0; bottom: 3px; text-align: center; font-size: 11px; font-weight: 800; line-height: 14px; color: var(--vp-primary); }
        .pr-deposit { grid-area: b; height: 44px; line-height: 44px; border: 0; padding: 0; border-radius: 999px; background: var(--vp-grad); color: var(--vp-on-primary); font-family: inherit; font-size: 14px; font-weight: 500; text-align: center; cursor: pointer; }

        @media (max-width: 767px) { .pr-steps { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; } .pr-step { width: auto; height: auto; aspect-ratio: 1; } }
        .pr-list { display: flex; flex-direction: column; gap: 10px; padding: 4px 12px 26px; box-sizing: border-box; }
        .pr-card { position: relative; overflow: hidden; border-radius: 8px; background: #26262e; cursor: pointer; }
        .pr-card__img { display: block; width: 100%; aspect-ratio: 351 / 136; object-fit: cover; transition: transform .5s cubic-bezier(.2, .7, .2, 1); will-change: transform; }
        @media (hover: hover) { .pr-card:hover .pr-card__img { transform: scale(1.08); } }
        .pr-card__ov { position: absolute; left: 0; right: 0; top: 0; height: 136px; box-sizing: border-box; display: flex; align-items: flex-end; gap: 8px; padding: 0 12px 12px; pointer-events: none; }
        .pr-card__title { flex: 1; min-width: 0; color: var(--vp-text-img); text-shadow: var(--vp-text-img-shadow); font-size: 16px; font-weight: 600; line-height: 20px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        /* 更多胶囊：背景 rgba(0,0,0,.45)（任务单 16 验收标准） */
        .pr-more { flex: none; display: inline-flex; align-items: center; justify-content: center; height: 24px; padding: 0 10px; border-radius: 999px; background: rgba(255, 255, 255, 0.18); color: var(--vp-text-img); font-size: 12px; }
        .pr-card__foot { height: 43px; display: flex; align-items: center; gap: 8px; padding: 0 12px; box-sizing: border-box; color: #8d8d92; font-size: 12px; }
        .pr-card__desc { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .pr-go { display: flex; align-items: center; justify-content: center; flex: none; width: 24px; height: 24px; border-radius: 50%; background: rgba(255, 255, 255, 0.16); transition: background .2s, transform .2s; }
        .pr-card:hover .pr-go { background: var(--vp-primary); transform: translateX(2px); }
        .pr-card:hover .pr-go svg { stroke: var(--vp-on-primary); }
        :global(.promotion_pg__pr-skel) { width: 100%; height: 179px; }

        /* ---- 网页端 1280（横幅与双列卡片来自实测） ---- */
        @media (min-width: 768px) {
          .pr { padding: 0 32px; background: transparent; }
          .pr-bar { display: none; }
          .pr-titlerow { display: flex; align-items: center; justify-content: space-between; }
          .pr-title { display: flex; align-items: center; gap: 12px; margin: 0; padding: 22px 0 0; font-size: 24px; line-height: 30px; font-weight: 800; }
          .pr-banner { height: auto; margin-top: 20px; padding: 0; }
          .pr-banner__bg { grid-template-columns: 1fr auto; grid-template-areas: "t s" "b s"; row-gap: 23px; align-content: center;
            height: 167px; padding: 24px; border-radius: 20px; background-image: url(/assets/promotion/first5-desktop.webp); }
          .pr-t { padding-left: 0; }
          .pr-t1 { font-size: 32px; line-height: 32px; font-weight: 800; }
          .pr-t2 { margin-top: 4px; font-size: 24px; line-height: 24px; font-weight: 800; }
          .pr-steps { display: flex; align-self: center; gap: 8px; }
          .pr-step { width: 108px; height: 108px; border-radius: 12px; }
          .pr-step__rank { top: 8px; height: 16px; line-height: 16px; padding: 0 8px; font-size: 11px; }
          .pr-step__ico { top: 28px; width: 48px; height: auto; }
          .pr-step__cap { left: 0; right: 0; bottom: 0; height: 32px; line-height: 32px; font-size: 15px; background: rgba(255, 255, 255, 0.12); }
          /* 1280 首卡按钮：白底黑字，位于标题下方左对齐；尺寸取参考 json（1280 w158 h36 r12，y239） */
          .pr-deposit { justify-self: start; width: 158px; height: 36px; line-height: 36px; border-radius: 12px; background: #fff; color: #000; font-size: 14px; }
          .pr-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px 16px; padding: 32px 0 32px; }
          .pr-card { aspect-ratio: 755 / 361; border-radius: 16px; }
          .pr-card__img { height: 100%; aspect-ratio: auto; }
          .pr-card__ov { height: 100%; padding: 0 16px 16px; }
          .pr-card__title { font-size: 16px; }
          /* 网页端卡片不显示描述行（参考站卡片只有图片 + 底部标题/更多） */
          .pr-card__foot { display: none; }
          .pr-more { height: 34px; padding: 0 16px; font-size: 14px; font-weight: 700; }
          :global(.promotion_pg__pr-skel) { height: 268px; }
        }
        /* 桌面：外壳已把页面盒子放在 x=276、y=80（实测），内容直接贴满盒子；标题上距 2px 使标题落在 y=82 */
        @media (min-width: 1024px) {
          .pr { padding: 0; }
          .pr-title { padding: 2px 0 0; }
        }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
