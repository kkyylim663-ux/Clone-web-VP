'use client'
// VIP（对应 vp-web/app/pages/vip.vue）。等级列表取自 post('/api/web/site/vipLevels')（10 级），升级奖金取自 /api/web/promo/vipBonus（USDT）并按汇率折算成 MYR（整数分）。
// ?state=: '' 默认（按登录态）| guest 访客（无进度）| member 已登录（有 EXP 进度） | loading | empty | error
// 三个内容分区（参考站结构，来源 docs/audit/haiku-tasks/13-vip-tabs-structure.md）：等级奖励 / 每月福利 / 常见问题。
// 等级行右侧「升级」胶囊：已达到 = 主色描边；未达到 = 灰底 + 锁图标占位。点击：未登录走登录守卫，已登录弹提示（推断，参考站行为未实测）。
import { Suspense, useState, type CSSProperties } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useLayout } from '@/context/LayoutContext'
import { useGate } from '@/lib/useGate'
import { pickLang } from '@/lib/pickLang'
import type { ApiVipLevel } from '@/lib/types'
import type { CurrencyRatio } from '@/lib/currency'
import { VIP_MONTHLY_USDT, VIP_TIER_NAMES } from '@/lib/mock/promo'
import { usePromoData } from '@/components/promo/usePromoData'
import { cx, fmtCents, usdtToMyrCents } from '@/components/promo/util'
import Icon from '@/components/ui/Icon'
import SkBox from '@/components/ui/SkBox'
import SkStatus from '@/components/shared/SkStatus'

export default function Page() {
  return <Suspense fallback={null}><VipPage /></Suspense>
}

const medal = (i: number) => `/assets/vip/medal-${Math.max(1, Math.min(5, i + 1))}.webp`
const TABS = ['bonus', 'perks', 'faq'] as const
const FAQ_IDS = [1, 2, 3, 4] as const

function VipPage() {
  const sp = useSearchParams()
  const st = sp.get('state') ?? ''
  const { lang, t } = useLanguage()
  const { loggedIn, user } = useAuth()
  const { back, guard } = useGate()
  const { showToast } = useLayout()
  const levelsQ = usePromoData<{ list: ApiVipLevel[] }>('/api/web/site/vipLevels')
  const bonusQ = usePromoData<{ list: { level: number, bonusUsdt: string }[] }>('/api/web/promo/vipBonus')
  const ratesQ = usePromoData<CurrencyRatio[]>('/api/web/currencyRatio/list')
  const [tab, setTab] = useState<(typeof TABS)[number]>('bonus')
  const [faqOpen, setFaqOpen] = useState<number>(1)
  const [heroIdx, setHeroIdx] = useState<number | null>(null)

  const member = st === 'member' || (st !== 'guest' && loggedIn)
  const curLevel = member ? (user?.level ?? 0) : 0
  const exp = Number(user?.exp ?? 0)
  const levels = (levelsQ.data?.list ?? []).slice().sort((a, b) => a.level - b.level)
  const bonusOf = new Map((bonusQ.data?.list ?? []).map((b) => [b.level, b.bonusUsdt]))
  const myr = ratesQ.data?.find((r) => r.currency === 'MYR')
  const rateScaled = myr ? Math.round(Number(myr.value) * 10000) : 0
  const toMyr = (usdt: string): string => (rateScaled ? fmtCents(usdtToMyrCents(usdt, rateScaled)) : '0.00')
  // 轮播下方的等级名（自写占位名，按当前等级取）
  const tierCount = VIP_TIER_NAMES.length
  const shownIdx = heroIdx ?? Math.min(curLevel, tierCount - 1)
  const topName = pickLang(VIP_TIER_NAMES[shownIdx], lang)?.name ?? ''
  const shift = (d: number) => setHeroIdx((i) => Math.max(0, Math.min(tierCount - 1, (i ?? Math.min(curLevel, tierCount - 1)) + d)))

  const mode = st === 'loading' || st === 'empty' || st === 'error' ? st
    : levelsQ.loading ? 'loading'
      : levelsQ.error ? 'error'
        : levels.length ? 'data' : 'empty'

  const upgrade = () => guard('bonus', () => showToast(t('vip.upgradeTip')))
  const upgradeBtn = (unlocked: boolean, cls: string) => (
    <button type="button" className={cx('vp-btn', cls, unlocked && 'on')} onClick={upgrade}>
      {unlocked ? null : <Icon name="lock" size={12} className="vip_pg__vp-lock" />}
      <span>{t('vip.upgrade')}</span>
    </button>
  )

  return (
    <div className={cx('vp', member && 'vp--member')}>
      {/* 吸顶头部：移动端 294 高（含顶栏、徽章、标签栏）；网页端不吸顶 */}
      <div className="vp-head">
        <header className="vp-bar">
          <span className="vp-back" aria-hidden="true" onClick={back}>‹</span>
          <h1 className="vp-bar__title">VIP</h1>
        </header>

        <div className="vp-hero">
          {/* 所有徽章排成一条轨道：按与当前等级的距离平移 / 缩放 / 淡出，点箭头时整条滑动 */}
          <div className="vp-track">
            {Array.from({ length: tierCount }, (_, i) => {
              const d = i - shownIdx
              const ad = Math.abs(d)
              return <img key={i} className="vp-m" data-d={d} src={medal(i)} alt="" style={{ '--d': d, '--s': ad === 0 ? 1 : 0.76, '--o': ad === 0 ? 1 : ad === 1 ? 0.65 : 0 } as CSSProperties} />
            })}
          </div>
          <p className="vp-name" key={shownIdx}>{topName}</p>
          <div className="vp-dots" aria-hidden="true">{Array.from({ length: tierCount }, (_, n) => <i key={n} className={n === shownIdx ? 'on' : ''} />)}</div>
          <span className={cx('vp-arr vp-arr--l', shownIdx <= 0 && 'vp-arr--dis')} role="button" tabIndex={0} aria-label="prev" onClick={() => shift(-1)}>‹</span>
          <span className={cx('vp-arr vp-arr--r', shownIdx >= tierCount - 1 && 'vp-arr--dis')} role="button" tabIndex={0} aria-label="next" onClick={() => shift(1)}>›</span>
        </div>

        <div className="vp-tabs" role="tablist">
          {TABS.map((k) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} className={cx('vp-tab', tab === k && 'on')} onClick={() => setTab(k)}>
              {t(`vip.tab.${k}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="vp-list">
        {tab === 'faq' ? (
          <div className="vp-faq">
            {FAQ_IDS.map((n) => {
              const open = faqOpen === n
              return (
                <div key={n} className={cx('vp-faq__item', open && 'on')}>
                  <button type="button" className="vp-faq__q" aria-expanded={open} onClick={() => setFaqOpen(open ? 0 : n)}>
                    <span>{t(`vip.faq.q${n}`)}</span>
                    <span className="vp-faq__sign" aria-hidden="true">{open ? '−' : '+'}</span>
                  </button>
                  {open ? <p className="vp-faq__a">{t(`vip.faq.a${n}`)}</p> : null}
                </div>
              )
            })}
          </div>
        ) : (
          <>
            {/* 状态块：loading / empty / error（只作用于等级数据的两个分区） */}
            {mode === 'loading' ? [0, 1, 2, 3, 4].map((n) => <SkBox key={n} state={t('status.loading')} className="vip_pg__vp-skel" />) : null}
            {mode === 'empty' ? <SkStatus kind="empty" title={t('vip.empty')} hint={t('vip.emptyHint')} h={200} className="vip_pg__vp-status" /> : null}
            {mode === 'error' ? <SkStatus kind="error" h={200} className="vip_pg__vp-status" onRetry={levelsQ.reload} /> : null}

            {/* 分区 1：等级奖励 */}
            {mode === 'data' && tab === 'bonus' ? levels.map((lv) => {
              const need = Number(lv.needExp)
              const remain = Math.max(0, need - exp)
              const unlocked = lv.level <= curLevel
              const pct = need > 0 ? Math.min(100, Math.round((exp / need) * 100)) : 100
              const bonusUsdt = bonusOf.get(lv.level) ?? '0'
              const expText = member ? t('vip.toNext', { n: remain, level: lv.level }) : t('vip.loginProgress')
              return (
                <article key={lv.level} className="vp-lv">
                  {/* 移动端行头：竖时间轴点 + 「VIP n」+ 进度文字 + 升级胶囊 */}
                  <header className="vp-lv__head">
                    <i className="vp-lv__dot" aria-hidden="true" />
                    <div className="vp-lv__meta">
                      <div className="vp-lv__row">
                        <b className="vp-lv__name">{t('vip.levelName', { n: lv.level })}</b>
                        <span className="vp-lv__exp">{expText}</span>
                        <i className="vp-info" aria-hidden="true">i</i>
                      </div>
                      {member ? <div className="vp-lv__bar"><i style={{ width: `${pct}%` }} /></div> : null}
                    </div>
                    {upgradeBtn(unlocked, 'vp-btn--head')}
                  </header>

                  {/* 奖励卡：奖励图 + 金额（MYR） */}
                  <div className="vp-card">
                    <i className="vp-dt" aria-hidden="true" />
                    <div className="vp-card__lab">
                      <b>{t('vip.levelName', { n: lv.level })}</b>
                      <span className="vp-lab__exp">{expText}<i className="vp-info" aria-hidden="true">i</i></span>
                      {member ? <div className="vp-lv__bar"><i style={{ width: `${pct}%` }} /></div> : null}
                    </div>
                    <div className="vp-card__body">
                      <img className="vp-badge" src={medal(lv.level)} alt="" />
                      <span className="vp-amt">MYR {toMyr(bonusUsdt)}</span>
                    </div>
                    {upgradeBtn(unlocked, 'vp-btn--card')}
                  </div>
                </article>
              )
            }) : null}

            {/* 分区 2：每月福利（每个等级一行：等级名 + 金额 + 状态） */}
            {mode === 'data' && tab === 'perks' ? levels.map((lv) => {
              const unlocked = lv.level <= curLevel
              return (
                <article key={lv.level} className="vp-perk">
                  <b className="vp-perk__name">{t('vip.levelName', { n: lv.level })}</b>
                  <span className="vp-perk__amt">{t('vip.perkAmount', { amt: toMyr(VIP_MONTHLY_USDT[lv.level] ?? '0') })}</span>
                  <span className={cx('vp-btn', 'vp-btn--perk', unlocked && 'on')}>{unlocked ? t('vip.unlocked') : t('vip.locked')}</span>
                </article>
              )
            }) : null}
          </>
        )}
      </div>

      <style jsx global>{`
        .vp { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; }

        /* ---- 移动端 375 ---- */
        .vp-head { position: sticky; top: 0; z-index: 2; height: 294px; background: #1a1a21; }
        .vp-bar { position: absolute; left: 0; right: 0; top: 0; z-index: 2; display: flex; align-items: center; gap: 12px; height: 55px; padding: 0 12px; box-sizing: border-box; }
        .vp-back { width: 24px; font-size: 26px; line-height: 1; cursor: pointer; }
        .vp-bar__title { margin: 0; font-size: 17px; font-weight: 600; }

        .vp-hero { position: absolute; left: 0; right: 0; top: 4px; height: 320px; overflow: hidden; background: linear-gradient(180deg, #2a2a33 0%, #1a1a21 100%); }
        .vp-track { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .vp-m { position: absolute; left: 50%; top: 50px; width: 150px; margin-left: -75px; transform: translateX(calc(var(--d) * 160px)) scale(var(--s)); opacity: var(--o); transition: transform .55s cubic-bezier(.16, 1, .3, 1), opacity .4s ease; will-change: transform; }
        .vp-name { position: absolute; left: 0; right: 0; top: 210px; margin: 0; text-align: center; font-size: 24px; line-height: 24px; font-weight: 600; animation: vp-name-in .45s cubic-bezier(.16, 1, .3, 1); }
        @keyframes vp-name-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .vp-dots i { transition: background .3s ease, transform .3s ease; }
        .vp-dots i.on { transform: scale(1.3); }
        @media (prefers-reduced-motion: reduce) { .vp-m, .vp-name { transition: none; animation: none; } }
        .vp-dots { position: absolute; left: 0; right: 0; top: 246px; display: flex; justify-content: center; gap: 6px; }
        .vp-dots i { width: 6px; height: 6px; border-radius: 50%; background: #555; }
        .vp-dots i.on { background: #fff; }

        .vp-tabs { position: absolute; left: 12px; right: 12px; top: 272px; height: 36px; box-sizing: border-box; display: flex; gap: 0;
          padding: 4px; border-radius: 8px; background: rgba(255, 255, 255, 0.06); }
        .vp-tab { flex: 1; display: flex; align-items: center; justify-content: center; border: 0; padding: 0; border-radius: 7px; background: transparent; color: #c4c8d0; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
        .vp-tab.on { background: rgba(255, 255, 255, 0.14); color: #fff; }

        .vp-list { padding: 36px 12px 0; box-sizing: border-box; }
        .vp-lv { position: relative; margin-bottom: 20px; }
        .vp-lv::before { content: ''; position: absolute; left: 8px; top: 20px; bottom: -20px; width: 1px; background: #3a3d44; }
        .vp-lv:last-child::before { display: none; }
        .vp-lv__head { position: relative; display: flex; align-items: center; justify-content: space-between; height: 26px; margin-bottom: 8px; padding-left: 22px; }
        .vp-lv__dot { position: absolute; left: 4px; top: 9px; width: 8px; height: 8px; border-radius: 50%; background: #8d8d92; }
        .vp-lv__meta { flex: 1; min-width: 0; }
        .vp-lv__row { display: flex; align-items: center; gap: 6px; }
        .vp-lv__name { font-size: 14px; font-style: italic; font-weight: 800; line-height: 16px; }
        .vp-lv__exp { color: var(--vp-muted); font-size: 11px; line-height: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        /* ⓘ 提示图标：12×12 圆圈 */
        .vp-info { display: inline-flex; flex: none; align-items: center; justify-content: center; width: 12px; height: 12px; border: 1px solid var(--vp-muted); border-radius: 50%; color: var(--vp-muted); font-size: 9px; font-style: normal; line-height: 1; }
        .vp-lv__bar { width: 150px; height: 3px; margin-top: 6px; border-radius: 2px; background: #3a3d44; overflow: hidden; }
        /* 进度条填充：来源：css-and-swiper §4（eleven-card-locked__progress-inner 0.5s ease） */
        .vp-lv__bar i { display: block; height: 100%; background: var(--vp-primary); transition: all .5s ease; }
        /* 升级胶囊：已达到 = 主色描边；未达到 = 灰底（锁图标占位 12×12） */
        .vp-btn { flex: none; display: inline-flex; align-items: center; justify-content: center; gap: 4px; box-sizing: border-box; width: 81px; height: 26px; border: 1px solid transparent; border-radius: 28px; padding: 0; background: rgba(255, 255, 255, 0.1); color: var(--vp-muted); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
        .vp-btn.on { background: transparent; border-color: var(--vp-primary); color: var(--vp-primary); }
        :global(.vip_pg__vp-lock) { flex: none; }
        .vp-card { position: relative; margin-left: 15px; height: 102px; box-sizing: border-box; padding: 8px 12px 8px 38px; border-radius: 12px; background: rgba(255, 255, 255, 0.05); }
        .vp-card__lab, .vp-dt, .vp-arr { display: none; }
        .vp-card__body { display: flex; flex-direction: column; align-items: center; gap: 4px; width: 84px; }
        .vp-badge { width: 56px; height: 56px; object-fit: contain; }
        .vp-amt { white-space: nowrap; font-size: 12px; font-weight: 700; }
        .vp-btn--card { display: none; }
        :global(.vip_pg__vp-skel) { height: 102px; margin: 0 0 20px 15px; }
        :global(.vip_pg__vp-status) { margin: 0 0 0 15px; }

        /* 每月福利行 */
        .vp-perk { display: flex; align-items: center; gap: 8px; box-sizing: border-box; height: 56px; margin: 0 0 12px; padding: 0 12px; border-radius: 12px; background: rgba(255, 255, 255, 0.05); }
        .vp-perk__name { flex: none; font-size: 14px; font-style: italic; font-weight: 800; }
        .vp-perk__amt { flex: 1; min-width: 0; color: var(--vp-muted); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        /* FAQ 折叠列表 */
        .vp-faq { display: flex; flex-direction: column; gap: 8px; }
        .vp-faq__item { border-radius: 12px; background: rgba(255, 255, 255, 0.05); overflow: hidden; }
        .vp-faq__q { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; box-sizing: border-box; min-height: 48px; padding: 12px 16px; border: 0; background: transparent; color: #fff; font-family: inherit; font-size: 14px; font-weight: 600; text-align: left; cursor: pointer; }
        .vp-faq__sign { flex: none; color: var(--vp-primary); font-size: 18px; line-height: 1; }
        .vp-faq__a { margin: 0; padding: 0 16px 14px; color: var(--vp-muted); font-size: 13px; line-height: 20px; }

        /* ---- 网页端 1280（英雄区 888 宽、列表 860 宽、标签与卡片为实测） ---- */
        @media (min-width: 768px) {
          .vp { background: #0f0b0a; }
          .vp-head { position: static; height: auto; background: transparent; }
          .vp-bar { display: none; }
          .vp-hero { position: relative; top: auto; left: auto; right: auto; width: 888px; height: 320px; margin: 2px auto 0; background: transparent; overflow: visible; }
          .vp-hero::before { content: ''; position: absolute; left: -200px; right: -200px; top: 0; bottom: 0; background: radial-gradient(ellipse at 50% 30%, rgba(255, 190, 110, .18), transparent 60%); pointer-events: none; }
          .vp-m { top: 20px; width: 200px; margin-left: -100px; transform: translateX(calc(var(--d) * 300px)) scale(var(--s)); }
          .vp-m[data-d='-1'] { opacity: 0; }
          .vp-name { top: 244px; font-size: 24px; line-height: 36px; font-weight: 700; color: #e3a35a; }
          .vp-dots { top: 290px; }
          .vp-dots i { background: #4a423d; }
          .vp-dots i.on { background: #e3a35a; }
          .vp-arr { display: flex; position: absolute; top: 100px; width: 40px; height: 40px; align-items: center; justify-content: center; border-radius: 10px; background: rgba(0, 0, 0, .45); border: 1px solid rgba(255, 255, 255, .12); color: #fff; font-size: 20px; line-height: 1; cursor: pointer; z-index: 2; user-select: none; transition: background .2s ease, transform .15s ease, opacity .2s ease; }
          .vp-arr:hover { background: rgba(0, 0, 0, .7); }
          .vp-arr:active { transform: scale(.92); }
          .vp-arr--dis { opacity: .3; pointer-events: none; }
          .vp-arr--l { left: 0; } .vp-arr--r { right: 0; }
          .vp-tabs { position: relative; left: auto; right: auto; top: auto; width: 888px; height: 40px; margin: 0 auto; padding: 4px; border-radius: 8px; }
          .vp-tab { font-size: 14px; }
          .vp-list { width: 888px; margin: 20px auto 0; padding: 0 0 32px; }
          .vp-lv { margin: 0 0 16px 28px; width: 860px; }
          .vp-lv::before { display: block; left: 8px; top: 0; bottom: -16px; }
          .vp-lv:last-child::before { display: none; }
          .vp-lv__head { display: none; }
          .vp-card { margin-left: 0; width: 860px; height: 106px; padding: 0; border-radius: 12px; }
          .vp-dt { display: block; position: absolute; left: -24px; top: 50%; width: 8px; height: 8px; margin-top: -4px; border-radius: 50%; background: #8d8d92; }
          .vp-card__lab { display: flex; position: absolute; left: 20px; top: 0; bottom: 0; flex-direction: column; justify-content: center; gap: 6px; }
          .vp-card__lab b { font-size: 18px; font-style: italic; font-weight: 800; color: #aeb2bb; line-height: 20px; }
          .vp-lab__exp { display: flex; align-items: center; gap: 6px; color: var(--vp-muted); font-size: 12px; }
          .vp-card__lab .vp-lv__bar { margin-top: 0; width: 120px; }
          .vp-card__body { position: absolute; left: 304px; top: 17px; width: 84px; }
          .vp-card__body .vp-amt { position: static; }
          .vp-btn--card { display: inline-flex; position: absolute; right: 20px; top: 33px; width: 128px; height: 40px; border-radius: 999px; font-size: 14px; }
          .vp-btn--card.on { background: transparent; }
          :global(.vip_pg__vp-skel) { width: 860px; height: 106px; margin: 0 0 16px 28px; }
          :global(.vip_pg__vp-status) { margin: 0; }
          .vp-perk { width: 860px; height: 64px; margin: 0 0 12px 28px; padding: 0 20px; }
          .vp-perk__name { width: 120px; }
          .vp-btn--perk { width: 128px; height: 40px; border-radius: 999px; font-size: 14px; }
          .vp-faq { width: 860px; margin-left: 28px; }
        }
        /* 桌面实色化：页面底、标签条、等级卡、福利行、FAQ 都用不透明色 + 描边，层次分明 */
        @media (min-width: 768px) {
          .vp { background: #17181e; }
          .vp-hero::before { background: radial-gradient(ellipse at 50% 35%, rgba(255, 190, 110, .30), transparent 62%); }
          .vp-tabs { background: #101116; border: 1px solid #343743; }
          .vp-tab { color: #aeb2bb; }
          .vp-tab.on { background: #3a3d4a; color: #fff; }
          .vp-card, .vp-perk, .vp-faq__item { background: #262932; border: 1px solid #343743; box-shadow: 0 2px 8px rgba(0, 0, 0, .35); }
          .vp-lv::before { background: #4a4e5c; }
          .vp-dt { background: #aeb2bb; }
          .vp-lv__bar { background: #101116; }
          .vp-btn { background: #3a3d4a; color: #c4c8d0; }
          .vp-btn.on { background: transparent; }
        }
        /* 桌面：外壳盒子已在 x=276、y=80（实测）；英雄区需落在 y=62，故上移 18px，横向在 968 宽内居中 */
        @media (min-width: 1024px) {
          .vp { padding: 0; }
          .vp-hero { margin: -18px auto 0; }
        }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
