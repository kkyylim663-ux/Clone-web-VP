'use client'
// 页脚上方的「购买加密货币」条 + 欢迎礼金横幅 + 更多优惠横幅（对照参考站）。支付标识为简化自绘，币种图标沿用页脚同一套。
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { FOOTER_COINS } from '@/lib/footerIcons'

const Apple = () => (
  <svg width="22" height="26" viewBox="0 0 24 28" fill="#fff" aria-hidden="true"><path d="M16.400 14.600c0-2.300 1.900-3.400 2-3.500-1.100-1.600-2.800-1.800-3.400-1.800-1.400-.1-2.800.9-3.500.9s-1.800-.8-3-.8c-1.500 0-3 .9-3.800 2.300-1.600 2.800-.4 7 1.200 9.300.8 1.100 1.700 2.400 2.900 2.300 1.200 0 1.600-.7 3-.7s1.800.7 3 .7 2-1.100 2.800-2.200c.9-1.300 1.200-2.500 1.300-2.600-.1 0-2.500-1-2.500-3.800Zm-2.300-6.800c.6-.8 1.100-1.800.9-2.800-.9 0-2 .6-2.600 1.400-.6.700-1.100 1.700-.9 2.700 1 .1 2-.5 2.600-1.300Z" /></svg>
)

export default function BuyPromo() {
  const { t } = useLanguage()
  const f = (k: string) => t(`base.footer.${k}`)
  return (
    <section className="bp">
      <div className="buy">
        <p className="bt">{f('buyTitle')}</p>
        <div className="mid">
          <div className="pay">
            <span className="gp"><svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285f4" d="M23.500 12.300c0-.8-.1-1.600-.2-2.300H12v4.400h6.500a5.600 5.600 0 0 1-2.400 3.700v3h3.900c2.300-2.100 3.500-5.200 3.500-8.800z" /><path fill="#34a853" d="M12 24c3.200 0 6-1.100 8-2.900l-3.900-3c-1.100.7-2.500 1.200-4.100 1.200-3.100 0-5.800-2.100-6.700-5H1.300v3.100A12 12 0 0 0 12 24z" /><path fill="#fbbc05" d="M5.300 14.300a7.200 7.200 0 0 1 0-4.600V6.600H1.300a12 12 0 0 0 0 10.800l4-3.100z" /><path fill="#ea4335" d="M12 4.800c1.800 0 3.300.6 4.600 1.800l3.400-3.400A12 12 0 0 0 1.300 6.600l4 3.100c.9-2.900 3.600-4.900 6.700-4.900z" /></svg>Pay</span>
            <span className="ap"><Apple />Pay</span>
            <span className="ca"><i>$</i>Cash</span>
            <span className="pp"><em>P</em>PayPal</span>
          </div>
          <div className="coins"><div className="ctrack">{[...FOOTER_COINS, ...FOOTER_COINS].map((svg, n) => <span key={n} aria-hidden={n >= FOOTER_COINS.length ? 'true' : undefined} dangerouslySetInnerHTML={{ __html: svg }} />)}</div></div>
        </div>
        <Link href="/deposit" className="gbtn">{f('buyBtn')}</Link>
      </div>

      <div className="wel">
        <span className="chev l" aria-hidden="true" /><span className="chev r" aria-hidden="true" /><span className="ring" aria-hidden="true" /><span className="shine" aria-hidden="true" />
        <div className="wl">
          <p className="wt">{f('welcome')}</p>
          <p className="pct">+500%</p>
        </div>
        <ol className="steps"><li><i>1</i>{f('step1')}</li><li><i>2</i>{f('step2')}</li></ol>
        <img className="gift" src="/assets/home/bonus-gift.webp" alt="" draggable={false} />
        <Link href="/promotion" className="gbtn sm ring-btn">{f('getIt')}</Link>
      </div>

      <div className="more">
        <span className="mi" aria-hidden="true"><svg width="30" height="30" viewBox="0 0 30 30"><path d="M15 1.500l3.200 2.400 4-.3 1.400 3.800 3.500 2-.9 3.900 1.700 3.600-2.800 2.900-.2 4-3.900.9-2.700 3-3.700-1.600-3.700 1.600-2.700-3-3.900-.9-.2-4-2.800-2.900 1.700-3.600-.9-3.900 3.500-2 1.400-3.800 4 .3z" fill="#e9ebf0" /><path d="m10.500 19.500 9-9" stroke="#3a3d46" strokeWidth="2.200" strokeLinecap="round" /><circle cx="11" cy="11" r="1.800" fill="#3a3d46" /><circle cx="19" cy="19" r="1.800" fill="#3a3d46" /></svg></span>
        <b>{f('morePromo')}</b>
        <Link href="/promotion" className="go">{f('goNow')}<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3.500 4.500 4.500L6 12.500" /></svg></Link>
      </div>

      <style jsx>{`
        .bp { margin-top: 20px; display: grid; gap: 16px; }
        .buy { position: relative; display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 12px 16px; padding: 18px 0 4px; }
        .buy::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, .28), transparent); }
        .bt { margin: 0; max-width: 240px; font-size: 18px; font-weight: 700; line-height: 1.3; color: #fff; }
        .mid { grid-column: 1 / -1; grid-row: 2; display: flex; flex-direction: column; align-items: center; gap: 14px; }
        .pay { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 14px 28px; color: #fff; font-size: 26px; font-weight: 500; }
        .pay span { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
        .gp b { font-weight: 700; }
        .gp { letter-spacing: -.01em; }
        .ca i { width: 30px; height: 30px; border-radius: 8px; background: #00d64f; color: #fff; display: inline-flex; align-items: center; justify-content: center; font: 700 22px/1 inherit; font-style: normal; margin-right: 4px; }
        .ca { font-size: 24px; font-weight: 700; }
        .pp { font-style: italic; font-weight: 800; color: #1a6fd6; font-size: 22px; }
        .pp em { color: #0b4aa8; font-size: 28px; margin-right: 2px; }
        .coins { width: 380px; max-width: 100%; overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent); mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent); }
        .ctrack { display: flex; gap: 12px; width: max-content; animation: bp-coins 22s linear infinite; }
        .coins:hover .ctrack { animation-play-state: paused; }
        .coins :global(span) { display: block; flex: none; width: 30px; height: 30px; color: #fff; opacity: .85; }
        @keyframes bp-coins { to { transform: translateX(calc(-50% - 6px)); } }
        :global(.gbtn) { display: inline-flex; align-items: center; justify-content: center; height: 48px; padding: 0 28px; border-radius: 14px; background: linear-gradient(180deg, #7cf7a4, #35d56d); color: #0b1c12; font-size: 16px; font-weight: 700; text-decoration: none; box-shadow: 0 6px 18px rgba(53, 213, 109, .25); transition: filter .2s, transform .15s; white-space: nowrap; }
        :global(.gbtn):hover { filter: brightness(1.08); }
        :global(.gbtn):active { transform: scale(.97); }
        :global(.gbtn.sm) { height: 52px; padding: 0 32px; border-radius: 12px; font-size: 16px; }

        .wel { position: relative; display: flex; align-items: center; gap: 28px; min-height: 142px; padding: 0 28px 0 90px; border-radius: 28px; overflow: hidden; background: radial-gradient(120% 140% at 62% 110%, rgba(40, 220, 160, .18), transparent 55%), linear-gradient(100deg, #12161f 0%, #0b0f16 60%, #0f1a1c 100%); box-shadow: inset 0 0 0 1px rgba(140, 190, 160, .55); }
        .chev { position: absolute; top: 0; bottom: 0; width: 70px; opacity: .5; background: repeating-linear-gradient(115deg, transparent 0 14px, rgba(255, 255, 255, .07) 14px 20px); pointer-events: none; }
        .chev.l { left: 0; clip-path: polygon(0 0, 55% 0, 100% 50%, 55% 100%, 0 100%); }
        .chev.r { right: 0; clip-path: polygon(45% 0, 100% 0, 100% 100%, 45% 100%, 0 50%); }
        .ring { position: absolute; left: 36%; top: -40%; width: 520px; height: 520px; border-radius: 50%; border: 1px solid rgba(255, 255, 255, .06); pointer-events: none; animation: bp-ring 8s ease-in-out infinite; }
        .shine { position: absolute; top: 0; bottom: 0; width: 120px; left: -160px; background: linear-gradient(100deg, transparent, rgba(255, 255, 255, .09), transparent); transform: skewX(-18deg); pointer-events: none; animation: bp-shine 5.5s ease-in-out infinite; }
        @keyframes bp-shine { 0%, 55% { left: -160px; } 100% { left: 110%; } }
        @keyframes bp-ring { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.06); opacity: .6; } }
        @keyframes bp-float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(1.5deg); } }
        @keyframes bp-glow { 0%, 100% { box-shadow: 0 0 0 3px rgba(5, 242, 106, .25), 0 6px 18px rgba(53, 213, 109, .25); } 50% { box-shadow: 0 0 0 5px rgba(5, 242, 106, .12), 0 8px 26px rgba(53, 213, 109, .45); } }
        @keyframes bp-pct { 0%, 100% { filter: drop-shadow(0 0 0 rgba(18, 245, 138, 0)); } 50% { filter: drop-shadow(0 0 14px rgba(18, 245, 138, .45)); } }
        :global(.ring-btn) { animation: bp-glow 2.6s ease-in-out infinite; border: 1px solid rgba(255, 255, 255, .25); }
        .wl { flex: none; }
        .wt { margin: 0; color: #f2d16c; font-size: 15px; font-weight: 800; letter-spacing: .01em; }
        .pct { margin: 2px 0 0; font-size: 56px; font-weight: 900; line-height: 1; letter-spacing: -.02em; background: linear-gradient(90deg, #12f58a, #00e0c0); -webkit-background-clip: text; background-clip: text; color: transparent; animation: bp-pct 3s ease-in-out infinite; }
        .steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; color: #fff; font-size: 12px; font-weight: 700; }
        .steps li { display: flex; align-items: center; gap: 8px; }
        .steps i { width: 20px; height: 20px; border-radius: 50%; background: #3a3f48; display: inline-flex; align-items: center; justify-content: center; font-style: normal; font-size: 11px; }
        .gift { position: absolute; left: 46%; bottom: -14px; height: 150px; width: auto; opacity: .95; filter: saturate(.7) brightness(.85); pointer-events: none; animation: bp-float 4.2s ease-in-out infinite; }
        .wel :global(.gbtn) { margin-left: auto; position: relative; }

        .more { position: relative; transition: filter .25s; display: flex; align-items: center; gap: 14px; height: 80px; padding: 0 20px 0 24px; border-radius: 40px; background: linear-gradient(90deg, #4a4e57 0%, #2c3038 38%, #121722 70%, #0e1320 100%); }
        .mi { width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; transition: transform .5s; }
        .more:hover .mi { transform: rotate(60deg); }
        .more b { font-size: 28px; font-weight: 800; letter-spacing: .04em; background: linear-gradient(180deg, #f1f2f5, #a9adb8); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .more :global(.go) { margin-left: auto; display: inline-flex; align-items: center; gap: 10px; height: 44px; padding: 0 20px; border-radius: 14px; background: #1c2230; color: #fff; font-size: 15px; font-weight: 700; text-decoration: none; transition: background .2s; }
        .more :global(.go svg) { transition: transform .2s; }
        .more :global(.go:hover) { background: #262e40; }
        .more :global(.go:hover svg) { transform: translateX(3px); }
        .more::after { content: ''; position: absolute; right: 0; top: 0; bottom: 0; width: 55%; border-radius: 0 40px 40px 0; background: repeating-linear-gradient(90deg, rgba(255, 255, 255, .035) 0 2px, transparent 2px 9px); pointer-events: none; -webkit-mask-image: linear-gradient(90deg, transparent, #000 60%); mask-image: linear-gradient(90deg, transparent, #000 60%); }

        @media (min-width: 900px) {
          .buy { grid-template-columns: 240px 1fr auto; }
          .mid { grid-column: 2; grid-row: 1; }
        }
        @media (prefers-reduced-motion: reduce) { .ctrack, .gift, .ring, .shine, .pct, :global(.ring-btn) { animation: none !important; } }
        @media (max-width: 767px) {
          .wel { flex-wrap: wrap; gap: 12px 20px; padding: 18px 16px 18px 70px; }
          .gift { display: none; }
          .wel :global(.gbtn) { margin-left: 0; }
          .pct { font-size: 44px; }
          .more b { font-size: 20px; }
          .pay { font-size: 20px; gap: 10px 18px; }
        }
      `}</style>
    </section>
  )
}
