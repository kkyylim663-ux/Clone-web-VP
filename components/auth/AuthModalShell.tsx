'use client'
import type { ReactNode } from 'react'
import { useGate } from '@/lib/useGate'
import { useLanguage } from '@/context/LanguageContext'

// 网页版弹窗外壳：遮罩 + 居中弹窗（position: fixed，水平垂直居中，与参考站一致）。
// 用法：<AuthModalShell width={800} height={638} sideWidth={426} side={<AuthSidePromo/>} closable>…</AuthModalShell>
// 去向：点遮罩 / ✕ = useGate().back（无历史回首页）。来源：需求（任务书第 1 条）；back 规则来源：文档（handlers-static §0.5）。
// 动效：弹窗进入 opacity 0→1 + scale 0.92→1，150ms ease-out（motion.css 的 --mo-modal）。来源：实测（motion-spec/interactions.md 桌面 c）。
//       关闭无过渡：关闭 = 路由切换，页面整体卸载。来源：实测（关闭瞬时）。
interface Props {
  width: number, height: number, radius?: number, closable?: boolean, blur?: boolean
  sideWidth?: number, side?: ReactNode, children: ReactNode
}

export default function AuthModalShell({ width, height, radius = 16, closable = false, blur = false, sideWidth = 0, side, children }: Props) {
  const { t } = useLanguage()
  const { back } = useGate()
  return (
    <div className="ams">
      <div className={`mask${blur ? ' blur' : ''}`} onClick={back} />
      <div className="box" style={{ width, height }}>
        {/* 进入动画挂在内层 panel 上：外层 box 负责居中（translate），两者 transform 不冲突 */}
        <div className="panel" style={{ borderRadius: radius }}>
          {sideWidth ? <div className="side" style={{ width: sideWidth }}>{side}</div> : null}
          <div className="main" style={{ width: width - sideWidth }}>
            {closable ? <button type="button" className="close" aria-label={t('auth.close')} onClick={back}>✕</button> : null}
            {children}
          </div>
        </div>
      </div>
      <style jsx>{`
        .ams { position: fixed; inset: 0; z-index: 50; pointer-events: none; }
        .mask { position: absolute; left: 244px; top: 60px; right: 0; bottom: 0; pointer-events: auto; background: rgba(0, 0, 0, 0.3); } /* 遮罩只盖内容区：参考站弹窗打开时顶栏和侧栏仍可点击（点击对照实测） */
        .mask.blur { background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(4px); }
        .box { pointer-events: auto; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); max-width: calc(100vw - 32px); }
        .panel { display: flex; width: 100%; height: 100%; overflow: hidden; background: #1c1d23; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: modal-in var(--mo-modal-dur, 150ms) ease-out both; }
        @keyframes modal-in { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        .side { position: relative; flex: none; overflow: hidden; }
        .main { position: relative; flex: none; box-sizing: border-box; display: flex; flex-direction: column; min-width: 0; }
        .close { position: absolute; top: 18px; right: 18px; z-index: 3; padding: 0; border: 0; background: none; color: #fff; font-size: 20px; line-height: 20px; cursor: pointer; }
      `}</style>
    </div>
  )
}
