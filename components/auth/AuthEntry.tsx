'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AuthFormPanel from './AuthFormPanel'
import AuthModalShell from './AuthModalShell'
import AuthSidePromo from './AuthSidePromo'
import { useViewport } from '@/lib/useViewport'
import HomeBehind from './HomeBehind'
import PageTopBar from './PageTopBar'

// 登录 / 注册页的共用版式：手机整页（<768 显示）+ 网页弹窗（>=768：首页占位 + 遮罩 + 居中弹窗 800×638，左宣传区 426）。
// 状态 ?state=：init(默认) | error | loading | email | codeOpen（演示参数，见 AuthFormPanel）。
// 登录成功回跳由 useAuth().goAfterLogin() 完成（不在本页跳转）。

export default function AuthEntry({ mode }: { mode: 'login' | 'register' }) {
  return <Suspense fallback={null}><Inner mode={mode} /></Suspense>
}

function Inner({ mode }: { mode: 'login' | 'register' }) {
  const sp = useSearchParams()
  const state = sp.get('state') ?? 'init'
  const vp = useViewport()
  const cls = mode === 'login' ? 'lg' : 'rg'
  return (
    <div className={cls}>
      {vp !== 'd' && <div className="page">
        <img className="bgart" src="/assets/auth/side.webp" alt="" />
        <div className="bg-top" />
        <PageTopBar kind="brand" />
        <AuthFormPanel mode={mode} variant="page" state={state} />
      </div>}

      {vp !== 'm' && <div className="desk">
        <HomeBehind />
        <AuthModalShell width={800} height={638} sideWidth={426} side={<AuthSidePromo />} closable>
          <AuthFormPanel mode={mode} variant="modal" state={state} />
        </AuthModalShell>
      </div>}

      <style jsx>{`
        .page { position: relative; height: 812px; overflow: hidden; background: #1a1a21; }
        .bg-top { position: absolute; left: 0; right: 0; top: 82px; height: 738px; border-radius: 8px; background: #1c1d23; }
        .bgart { position: absolute; left: 0; top: 0; width: 100%; height: 150px; object-fit: cover; object-position: top; opacity: 0.55; pointer-events: none; }
        .desk { display: none; }
        @media (min-width: 768px) {
          .page { display: none; }
          .desk { display: block; }
        }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
