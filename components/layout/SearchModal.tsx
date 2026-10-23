'use client'
// 桌面搜索弹窗（对照参考站）：标题 / 搜索框（Casino · 放大镜 · 输入）/ 分类胶囊（带图标）/ 左侧供应商列 / 游戏网格（浏览量 + 倍数徽标）。
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '@/context/LanguageContext'
import { post } from '@/lib/api'
import { coverV } from '@/lib/assets'
import { HScroll, useHScroll } from '@/components/ui/HScroll'
import { usePlay } from '@/components/browse/browseData'
import type { ApiGame } from '@/lib/types'

const CATS = [
  { key: '', icon: 'lobby', k: 'all' }, { key: 'slots', icon: 'slot', k: 'slot' }, { key: 'live', icon: 'livecasino', k: 'live' },
  { key: 'fishing', icon: 'fishing', k: 'fishing' }, { key: 'crash', icon: 'crash', k: 'crash' }, { key: 'mini', icon: 'minigame', k: 'mini' },
  { key: 'table', icon: 'tablegame', k: 'table' }, { key: 'buyin', icon: 'featurebuyin', k: 'buyin' }, { key: 'featured', icon: 'featuredslot', k: 'featured' }
]
const hash = (s: string) => Array.from(s).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
const MULT = ['5,000x', '1,000x', '375x', '15,025x', '10,000x', '2,000x', '21,175x']
interface Prov { slug: string, name: string, logo?: string }

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const { lang, t } = useLanguage()
  const s = (k: string) => t(`base.searchModal.${k}`)
  const play = usePlay()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [prov, setProv] = useState('')
  const [games, setGames] = useState<ApiGame[]>([])
  const [provs, setProvs] = useState<Prov[]>([])
  const catHs = useHScroll()
  const inp = useRef<HTMLInputElement>(null)

  useEffect(() => {
    post<{ list: Prov[] }>('/api/web/browse/providers', {}).then((d) => setProvs(d.list)).catch(() => {})
    inp.current?.focus()
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', key)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = prev }
  }, [onClose])

  useEffect(() => {
    let alive = true
    const id = setTimeout(() => {
      post<{ list: ApiGame[] }>('/api/web/site/games', { q: q.trim(), category: cat, provider: prov }).then((d) => { if (alive) setGames(d.list) }).catch(() => {})
    }, q ? 180 : 0)
    return () => { alive = false; clearTimeout(id) }
  }, [q, cat, prov])

  const name = (g: ApiGame) => g.translations[lang]?.name ?? g.translations.en?.name ?? g.slug

  return createPortal(
    <div className="sm-ov" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sm" role="dialog" aria-modal="true" aria-label={s('title')}>
        <header className="sm-h"><h2>{s('title')}</h2><button type="button" className="x" aria-label="close" onClick={onClose}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.400" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg></button></header>

        <div className="sm-in">
          <b>{s('scope')}</b><i />
          <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.500" cy="10.500" r="6.500" fill="none" stroke="#e6e8ec" strokeWidth="2" /><path d="m15.500 15.500 5 5" stroke="#e6e8ec" strokeWidth="2" strokeLinecap="round" /></svg>
          <input ref={inp} value={q} onChange={(e) => setQ(e.target.value)} placeholder={s('ph')} />
        </div>

        <div className="sm-cats">
          <HScroll hs={catHs} className="sm-cr">
            {CATS.map((c) => (
              <span key={c.key} role="button" tabIndex={0} className={`cp${cat === c.key ? ' on' : ''}`} onClick={() => setCat(c.key)}>
                <img src={`/assets/casino/cat-${c.icon}.webp`} alt="" draggable={false} />{s(c.k)}
              </span>
            ))}
          </HScroll>
          <button type="button" className="cn" aria-label="next" onClick={catHs.next}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3.500 4.500 4.500L6 12.500" /></svg></button>
        </div>

        <div className="sm-body">
          <aside className="sm-p">
            <p>{s('providers')}</p>
            <div className="pl">
              <span role="button" tabIndex={0} className={`pt all${prov === '' ? ' on' : ''}`} onClick={() => setProv('')}>{s('all')}</span>
              {provs.map((p) => (
                <span key={p.slug} role="button" tabIndex={0} className={`pt${prov === p.name ? ' on' : ''}`} onClick={() => setProv(p.name)}>
                  {p.logo ? <img src={`/assets/providers/${p.logo}.png`} alt={p.name} draggable={false} /> : p.name}
                </span>
              ))}
            </div>
          </aside>
          <section className="sm-g">
            <p>{s('game')}</p>
            {games.length === 0 ? <div className="emp">{s('empty')}</div> : (
              <div className="gg">
                {games.map((g) => {
                  const h = hash(g.slug)
                  const src = coverV(g.slug)
                  return (
                    <div key={g.slug} className="gc" role="button" tabIndex={0} title={name(g)} onClick={() => { onClose(); play(g.slug) }}>
                      {src ? <img src={src} alt={name(g)} loading="lazy" draggable={false} /> : <span className="ph" />}
                      <span className="vw"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5c5 0 8.500 4.200 10 7-1.500 2.800-5 7-10 7S3.500 14.800 2 12c1.500-2.800 5-7 10-7Zm0 3.500a3.500 3.500 0 1 0 0 7 3.500 3.500 0 0 0 0-7Z" /></svg>{500 + (h % 11000)}</span>
                      {h % 3 !== 0 ? <span className="ml">{MULT[h % MULT.length]}</span> : null}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      <style jsx>{`
        .sm-ov { position: fixed; inset: 0; z-index: 120; background: rgba(0, 0, 0, .62); animation: sm-fade .18s ease; }
        .sm { position: absolute; left: 50%; top: 78px; transform: translateX(-50%); width: min(1350px, calc(100% - 24px)); height: calc(100% - 100px); display: flex; flex-direction: column; border-radius: 16px; background: #1f2026; box-shadow: 0 0 0 1px rgba(255, 255, 255, .06), 0 24px 60px rgba(0, 0, 0, .55); animation: sm-in .22s cubic-bezier(.2, .8, .2, 1); overflow: hidden; }
        @keyframes sm-fade { from { opacity: 0; } }
        @keyframes sm-in { from { opacity: 0; transform: translateX(-50%) translateY(14px) scale(.985); } }
        .sm-h { position: relative; flex: none; height: 70px; display: flex; align-items: center; justify-content: center; }
        .sm-h h2 { margin: 0; font-size: 20px; font-weight: 500; color: #fff; }
        .x { position: absolute; right: 22px; top: 22px; width: 30px; height: 30px; border: 0; background: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 8px; transition: background .2s; }
        .x:hover { background: rgba(255, 255, 255, .1); }
        .sm-in { flex: none; display: flex; align-items: center; gap: 12px; height: 52px; margin: 0 38px; padding: 0 16px; border-radius: 14px; background: #2b2c33; }
        .sm-in b { font-size: 16px; font-weight: 600; color: #fff; }
        .sm-in i { width: 1px; height: 20px; background: rgba(255, 255, 255, .2); }
        .sm-in input { flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; background: none; color: #fff; font: 500 18px/1 inherit; }
        .sm-in input::placeholder { color: #70737d; }
        .sm-in:focus-within { box-shadow: 0 0 0 1px rgba(5, 242, 106, .5); }
        .sm-cats { flex: none; position: relative; display: flex; align-items: center; gap: 8px; margin: 18px 38px 0; padding-top: 18px; border-top: 1px solid rgba(255, 255, 255, .08); }
        :global(.sm-cr) { flex: 1; min-width: 0; gap: 10px; }
        .cp { height: 62px; padding: 0 20px 0 12px; display: inline-flex; align-items: center; gap: 8px; border-radius: 16px; border: 1px solid transparent; background: #2b2c33; color: #c9ccd4; font-size: 17px; font-weight: 500; white-space: nowrap; cursor: pointer; transition: background .2s, color .2s; }
        .cp img { width: 38px; height: 38px; object-fit: contain; }
        .cp:hover { background: #34353d; color: #fff; }
        .cp.on { background: rgba(5, 242, 106, .08); border-color: rgba(5, 242, 106, .65); color: var(--vp-primary, #05f26a); }
        .cn { flex: none; width: 36px; height: 36px; border: 0; border-radius: 10px; background: #34353d; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-left: -46px; z-index: 2; }
        .sm-body { flex: 1; min-height: 0; display: flex; gap: 20px; padding: 20px 38px 24px; }
        .sm-p { flex: none; width: 122px; display: flex; flex-direction: column; min-height: 0; }
        .sm-p p, .sm-g > p { margin: 0 0 10px; font-size: 16px; font-weight: 500; color: #8d909a; }
        .pl { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; scrollbar-width: none; }
        .pl::-webkit-scrollbar { display: none; }
        .pt { flex: none; height: 56px; border-radius: 12px; border: 1px solid transparent; background: #2b2c33; display: flex; align-items: center; justify-content: center; padding: 0 10px; cursor: pointer; color: #fff; font-weight: 600; transition: background .2s; }
        .pt img { max-width: 100%; max-height: 34px; object-fit: contain; }
        .pt:hover { background: #34353d; }
        .pt.on { background: rgba(5, 242, 106, .1); border-color: rgba(5, 242, 106, .65); color: var(--vp-primary, #05f26a); }
        .pt.all { height: 54px; font-size: 18px; }
        .sm-g { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; }
        .gg { flex: 1; min-height: 0; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 24px 16px; align-content: start; grid-auto-rows: max-content; padding-right: 8px; scrollbar-width: thin; scrollbar-color: #4a4b53 transparent; }
        .gc { position: relative; width: 100%; height: auto; aspect-ratio: 145 / 198; min-height: 120px; border-radius: 12px; overflow: hidden; background: #2b2c33; cursor: pointer; transition: transform .2s; }
        .gc:hover { transform: translateY(-3px); }
        .gc img, .gc .ph { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
        .gc .ph { background: repeating-linear-gradient(135deg, #23262b 0 10px, #1d2024 10px 20px); }
        .vw { position: absolute; left: 8px; top: 8px; height: 26px; padding: 0 9px 0 7px; border-radius: 13px; background: rgba(0, 0, 0, .5); color: #fff; display: inline-flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 600; backdrop-filter: blur(2px); }
        .ml { position: absolute; right: 4px; top: 6px; min-width: 38px; height: 22px; padding: 0 6px; border-radius: 12px; background: #e0262c; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; transform: rotate(8deg); }
        .emp { padding: 60px 0; text-align: center; color: #70737d; }
        @media (max-width: 1000px) { .sm-p { width: 100px; } .cp { height: 52px; font-size: 15px; } .cp img { width: 30px; height: 30px; } }
      `}</style>
    </div>,
    document.body
  )
}
