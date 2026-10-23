'use client'
import SkBox from '@/components/ui/SkBox'
import SkStatus from '@/components/shared/SkStatus'
import SportsSkeleton from '@/components/promo/SportsSkeleton'
import { useT } from '@/context/LanguageContext'

// 体育容器骨架（对应 vp-web components/skeleton/misc/SkSportsFrame.vue）。
// state: loading 容器加载中 | ok 第三方容器加载成功（占位） | 其它 error 会话启动失败（可重试）
interface Props { state: 'loading' | 'ok' | 'error', onRetry?: () => void }

export default function SkSportsFrame({ state, onRetry }: Props) {
  const t = useT()
  return (
    <div className="spf">
      <header className="spf-bar">
        <span className="spf-logo">BRAND</span>
        <span className="spf-wallet" />
      </header>
      <div className="spf-body">
        {state === 'loading' ? <SkBox state={t('sports.loading')} label={t('sports.frameLoading')} className="promo_sksportsframe__spf-box" /> : null}
        {state === 'ok' ? <><div className="spf-sk"><SportsSkeleton /></div><div className="spf-box-m"><SkBox state={t('sports.ready')} label={t('sports.frame')} className="promo_sksportsframe__spf-box" /></div></> : null}
        {state === 'error' ? <SkStatus kind="error" title={t('sports.sessionFail')} h={240} className="promo_sksportsframe__spf-status" onRetry={onRetry} /> : null}
      </div>
      <style jsx global>{`
        .spf { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; }
        .spf-bar { display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 12px; box-sizing: border-box; }
        .spf-logo { width: 80px; height: 24px; line-height: 24px; text-align: center; border-radius: 4px; background: #2a2d33; color: #8d93a0; font-size: 12px; }
        .spf-wallet { width: 139px; height: 31px; border-radius: 19px; background: #26262c; }
        /* 手机：状态为 ok 时直接显示体育首页（同网页版内容，窄屏重排），不再只放「第三方容器」占位框 */
        .spf-sk { display: block; min-width: 0; overflow-x: hidden; background: #1a1a21; }
        .spf-box-m { display: none; }
        .spf-bar { display: none; } /* 外壳顶栏已有 Logo 与钱包，不再重复 */
        .spf-body { margin: 0 -12px; min-height: 696px; padding: 0 0 24px; box-sizing: border-box; overflow-x: hidden; }
        :global(.promo_sksportsframe__spf-box) { width: 100%; height: 100%; }
        :global(.promo_sksportsframe__spf-status) { margin-top: 40px; }

        /* 网页端（推断：无顶栏，内容区占满视口） */
        @media (min-width: 768px) {
          .spf-bar { display: none; }
          .spf-body { margin: 0; height: auto; min-height: calc(100vh - 150px); padding: 0; }
          .spf-sk { border-radius: 16px; overflow: hidden; }
          :global(.promo_sksportsframe__spf-status) { margin-top: 0; }
        }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
