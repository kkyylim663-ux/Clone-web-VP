'use client'
import { useViewport } from '@/lib/useViewport'
import { useLanguage } from '@/context/LanguageContext'
import { useGate } from '@/lib/useGate'
import AuthModalShell from './AuthModalShell'
import HomeBehind from './HomeBehind'
import PageTopBar from './PageTopBar'
import type { LegalSection } from '@/lib/legal/privacy'

// 条款 / 隐私政策页的版式（结构相同）：手机整页长文 + 网页模糊遮罩弹窗（373×560，正文区裁切）。
// 正文为占位条（法务文本待提供）；章节数与参考站高度一致：条款 30 章、隐私 12 章。
// 去向：✕ 与点遮罩 / ‹ = useGate().back。来源：需求（任务书第 1 条）。
export default function LegalPage({ title, sections, content }: { title: string, sections: number, content?: LegalSection[] }) {
  const { t } = useLanguage()
  const { back } = useGate()
  // 挂载后只保留当前视口用的那一套 DOM（另一套被 CSS 隐藏也要付渲染成本，手机上尤其明显）
  const mode = useViewport()
  return (
    <div className="lp">
      {mode !== 'd' && <div className="m">
        <PageTopBar kind="back" title={title} />
        <div className="body">
          {content ? content.map((s) => (
            <div key={s.h} className="tx">
              <h2>{s.h}</h2>
              {s.blocks.map((b, i) => (
                <div key={i}>
                  {b.sub ? <h3>{b.sub}</h3> : null}
                  {b.p.map((x, j) => <p key={j}>{x}</p>)}
                </div>
              ))}
            </div>
          )) : null}
          {/* 章节结构内联在 JSX 里（styled-jsx 只给 return 树里的元素加作用域类，不能放进变量） */}
          {!content && Array.from({ length: sections }, (_, n) => (
            <div key={n} className="sec">
              <i className="hd" />
              {[0, 1, 2].map((p) => (
                <div key={p} className="para">
                  {[1, 2, 3, 4, 5].map((l) => <i key={l} className={l === 5 ? 'ln short' : 'ln'} />)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>}

      {mode !== 'm' && <div className="d">
        <HomeBehind />
        <AuthModalShell width={373} height={560} blur>
          <div className="dh">
            <span className="dt">{title}</span>
            <span className="dx">
              <button type="button" className="dxb" aria-label={t('auth.close')} onClick={back}>✕</button>
            </span>
          </div>
          <div className="db">
            {content ? content.map((s) => (
              <div key={s.h} className="tx">
                <h2>{s.h}</h2>
                {s.blocks.map((b, i) => (
                  <div key={i}>
                    {b.sub ? <h3>{b.sub}</h3> : null}
                    {b.p.map((x, j) => <p key={j}>{x}</p>)}
                  </div>
                ))}
              </div>
            )) : null}
            {!content && Array.from({ length: mode === 'd' ? Math.min(sections, 3) : sections }, (_, n) => (
              <div key={n} className="sec">
                <i className="hd" />
                {[0, 1, 2].map((p) => (
                  <div key={p} className="para">
                    {[1, 2, 3, 4, 5].map((l) => <i key={l} className={l === 5 ? 'ln short' : 'ln'} />)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </AuthModalShell>
      </div>}

      <style jsx>{`
        .m { position: relative; min-height: 812px; background: #1a1a21; }
        .body { padding: 12px 16px; }
        .sec { margin-bottom: 10px; }
        .hd { display: block; width: 60%; height: 14px; margin: 20px 0 10px; border-radius: 4px; background: #5b6068; }
        .para { margin-bottom: 12px; }
        .ln { display: block; width: 100%; height: 8px; margin-bottom: 8px; border-radius: 4px; background: #3a3d46; }
        .ln:last-child { margin-bottom: 0; }
        .ln.short { width: 60%; }
        .tx h2 { margin: 20px 0 8px; font-size: 16px; font-weight: 600; line-height: 22px; color: #fff; }
        .tx h3 { margin: 12px 0 6px; font-size: 14px; font-weight: 600; line-height: 20px; color: #e4e6ea; }
        .tx p { margin: 0 0 10px; font-size: 13px; line-height: 20px; color: #aeb2bb; overflow-wrap: anywhere; }
        .d { display: none; }
        .dh { position: absolute; left: 16px; right: 16px; top: 6px; height: 40px; }
        .dt { position: absolute; left: 0; right: 0; top: 10px; text-align: center; color: #fff; font-size: 16px; font-weight: 600; }
        .dx { position: absolute; right: 0; top: 10px; }
        .dxb { padding: 0; border: 0; background: none; color: #fff; font-size: 18px; line-height: 20px; cursor: pointer; }
        .db { position: absolute; left: 16px; right: 16px; top: 52px; bottom: 10px; overflow-y: auto; scrollbar-width: none; }
        .db::-webkit-scrollbar { display: none; }
        .db .sec { margin-bottom: 4px; }
        .db .hd { height: 12px; margin: 10px 0 8px; }
        .db .para { margin-bottom: 10px; }
        .db .ln { height: 8px; margin-bottom: 11px; }
        .db .ln:last-child { margin-bottom: 0; }
        @media (min-width: 768px) {
          .m { display: none; }
          .d { display: block; }
        }
      `}</style>
    </div>
  )
}
