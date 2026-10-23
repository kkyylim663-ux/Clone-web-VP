'use client'
import Link from 'next/link'
import { brand } from '@/config/brand'
import { useLanguage } from '@/context/LanguageContext'
import SkImg from '@/components/ui/SkImg'
import PolicyModal, { type PolicyTab } from '@/components/layout/PolicyModal'
import { useState } from 'react'
import { FOOTER_COINS, FOOTER_SOCIAL } from '@/lib/footerIcons'
import BuyPromo from '@/components/layout/BuyPromo'

// 页脚：结构对齐参考站（顶栏 / 三张入口卡 / 链接列 / 币种 / 法务说明 + 认证位），文案与图片全部自有占位。
export default function SiteFooter() {
  const { t } = useLanguage()
  const f = (k: string) => t(`base.footer.${k}`)
  const [policy, setPolicy] = useState<PolicyTab | null>(null)
  const [lastTab, setLastTab] = useState<PolicyTab>('aml')
  const openPolicy = (k: PolicyTab) => { setLastTab(k); setPolicy(k) }
  const pl = (k: PolicyTab) => <span className="plink" role="button" tabIndex={0} onClick={() => openPolicy(k)}>{f(`policy.${k}`)}</span>
  const links = (rows: [string, string][]) => rows.map(([h, k], i) => (
    <span key={h + k}>{i > 0 ? <i className="sep">|</i> : null}<Link href={h}>{f(k)}</Link></span>
  ))
  const top = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="foot">
      <BuyPromo />
      <div className="ftail">
      <div className="bar">
        <span className="logo">{brand.name}</span>
        <i className="line" />
        <span className="up" role="button" tabIndex={0} aria-label="top" onClick={top}>⌃</span>
      </div>

      <div className="cards">
        <div className="fcard c-sup">
          <div className="fct"><span className="fttl"><b>{f('supportTitle')}</b><span className="ftag">24/7</span></span><small>{f('supportDesc')}</small></div>
          <SkImg src="/assets/mascot/fox-support.webp" className="foot__art" w={190} h={190} radius={0} label="" />
          <Link href="/chat" className="fbtn">{f('contact')}</Link>
        </div>
        <div className="fcard">
          <div className="fct"><span className="fttl"><b>{f('app')}</b></span><small>{f('appDesc')}</small></div>
          <span className="fbtn" role="button" tabIndex={0}>{f('download')}</span>
        </div>
        <div className="fcard">
          <div className="fct"><span className="fttl"><b>{f('desktop')}</b></span><small>{f('desktopDesc')}</small></div>
          <span className="fbtn" role="button" tabIndex={0}>{f('install')}</span>
        </div>
      </div>

      <div className="links">
        <div><h5>{f('legalTitle')}</h5><p>{pl('privacy')}<i className="sep">|</i>{pl('aml')}<i className="sep">|</i>{pl('responsible')}<i className="sep">|</i>{pl('terms')}<i className="sep">|</i>{pl('complaint')}</p></div>
        <div><h5>{f('promoTitle')}</h5><p>{links([['/bonus', 'bonus'], ['/promotion', 'promotions'], ['/vip', 'vip'], ['/refer-earn', 'refer']])}</p></div>
        <div className="soc"><h5>{f('community')}</h5><div className="icons">{FOOTER_SOCIAL.map((svg, n) => <span key={n} className="soc-i" dangerouslySetInnerHTML={{ __html: svg }} />)}</div></div>
      </div>

      <div className="cur">
        <h5>{f('currency')}</h5>
        <div className="crow">
          <div className="coins">{FOOTER_COINS.map((svg, n) => <span key={n} className="coin-i" dangerouslySetInnerHTML={{ __html: svg }} />)}</div>
          <span className="rate"><img src="/assets/footer/flag-my.svg" alt="" width={20} height={20} />{f('rate')}</span>
        </div>
      </div>

      <div className="legal">
        <div className="ltxt"><p>{f('legal1')}</p><p>{f('legal2')}</p></div>
        <div className="certs"><img src="/assets/footer/cert-1.webp" alt="" width={108} height={48} /><img src="/assets/footer/cert-2.webp" alt="" width={108} height={48} /><svg className="cga" width="108" height="48" viewBox="0 0 108 48" role="img" aria-label="CGA"><rect width="108" height="48" rx="2" fill="#0a9a52" /><text x="54" y="29" textAnchor="middle" fontSize="27" fontWeight="900" fill="#fff" fontFamily="Arial, sans-serif">CGA</text><text x="54" y="41" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff" fontFamily="Arial, sans-serif">cert.cga.cw</text></svg></div>
      </div>

      <div className="copy">
        <span>©{new Date().getFullYear()} {brand.name} | {f('rights')}</span>
        <img src="/assets/footer/shield.webp" alt="" width={32} height={32} />
      </div>

      </div>

      <PolicyModal open={policy !== null} tab={policy ?? lastTab} onTab={openPolicy} onClose={() => setPolicy(null)} />

      <style jsx>{`
        .ftail { display: none; }
        .foot { margin-top: 8px; padding: 8px 16px 80px; color: var(--vp-muted); font-size: 13px; }
        .bar { display: flex; align-items: center; gap: 16px; }
        .logo { font-weight: 800; letter-spacing: .08em; color: var(--vp-primary); padding: 4px 10px; border: 1px dashed var(--vp-primary); border-radius: 6px; font-size: 14px; }
        .line { flex: 1; height: 1px; background: #2c2e34; }
        .up { width: 40px; height: 40px; border-radius: 8px; background: rgba(255, 255, 255, .1); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; cursor: pointer; }
        .cards { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 24px; }
        .fcard { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 110px; padding: 16px 20px; border-radius: 16px; background: rgba(255, 255, 255, .05); overflow: hidden; }
        .fct { display: flex; flex-direction: column; gap: 6px; min-width: 0; flex: 1; }
        .fttl { display: flex; align-items: center; gap: 8px; }
        .fttl b { color: #fff; font-size: 15px; }
        .fct small { max-width: 190px; font-size: 13px; line-height: 1.4; }
        .ftag { height: 22px; padding: 0 10px; border-radius: 999px; background: #fff; color: #111; font-size: 12px; font-weight: 700; line-height: 22px; }
        :global(.foot__art) { position: absolute; left: 40%; bottom: -6px; z-index: 2; pointer-events: none; display: none !important; filter: drop-shadow(0 10px 14px rgba(0, 0, 0, .45)); }
        :global(.fbtn) { position: relative; flex: none; height: 44px; padding: 0 28px; display: inline-flex; align-items: center; border-radius: 10px; background: rgba(255, 255, 255, .12); color: #fff; font-size: 15px; font-weight: 700; text-decoration: none; cursor: pointer; white-space: nowrap; }
        .links { display: grid; grid-template-columns: 1fr; gap: 20px; margin-top: 28px; }
        h5 { margin: 0 0 14px; color: #fff; font-size: 16px; font-weight: 600; }
        .links p { margin: 0; max-width: 260px; line-height: 24px; font-size: 12px; }
        .links :global(a) { color: var(--vp-muted); text-decoration: none; }
        .plink { color: var(--vp-muted); cursor: pointer; }
        .plink:hover { color: #fff; }
        .sep { margin: 0 8px; font-style: normal; color: #5a5d66; }
        .icons { display: flex; gap: 8px; }
        .soc-i { display: block; width: 32px; height: 32px; color: #fff; }
        .soc-i :global(svg) { display: block; }
        .coin-i { display: block; width: 28px; height: 28px; color: #fff; }
        .coin-i :global(svg) { display: block; }
        .copy { display: flex; align-items: center; justify-content: space-between; margin-top: 24px; padding-top: 16px; border-top: 1px solid #2c2e34; font-size: 10px; color: rgba(255, 255, 255, .6); }
        .cur { margin-top: 24px; padding-top: 24px; border-top: 1px solid #2c2e34; }
        .crow { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .coins { display: flex; flex-wrap: wrap; gap: 8px; }
        .rate { display: inline-flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 8px; background: rgba(255, 255, 255, .08); color: #9aa1b1; font-size: 12px; }
        .legal { display: grid; gap: 14px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #2c2e34; }
        .legal p { margin: 0 0 14px; max-width: 700px; font-size: 12px; line-height: 1.8; }
        .certs { display: flex; align-items: center; gap: 8px; }
        .certs img { display: block; width: 108px; height: 48px; object-fit: contain; }
        @media (min-width: 768px) {
          .ftail { display: block; }
          .foot { padding: 32px 0 40px; }
          .cards { grid-template-columns: 2.6fr 1fr 1fr; gap: 20px; margin-top: 56px; }
          .c-sup { overflow: visible; }
          :global(.foot__art) { display: flex !important; }
          .links { grid-template-columns: 1fr 1fr auto; }
          .soc { justify-self: end; }
          .legal { grid-template-columns: 1fr auto; align-items: center; }
        }
      `}</style>
    </footer>
  )
}
