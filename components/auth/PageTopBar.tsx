'use client'
import { useGate } from '@/lib/useGate'
import { useLanguage } from '@/context/LanguageContext'
import { brand } from '@/config/brand'
import IconTile from '@/components/ui/IconTile'

// 手机整页的顶部栏（不含参考站 Logo 图片，只用文字占位）。
// kind=brand：登录/注册（品牌文字 + 关闭）；kind=back：子页（返回 + 标题 + 右侧图标占位）。
// 去向：返回 / ✕ = useGate().back（无历史回首页）。来源：文档（handlers-static §0.5、§3 navBar 返回=back）；
//       brand 页 ✕ 同样 back。来源：推断（参考站手机登录页 ✕ 未实测）。
interface Props { kind?: 'brand' | 'back', title?: string, icon?: boolean, onBack?: () => void }

export default function PageTopBar({ kind = 'back', title = '', icon = true, onBack }: Props) {
  const { t } = useLanguage()
  const { back } = useGate()
  const go = onBack ?? back
  return (
    <div className={`ptb is-${kind}`}>
      {kind === 'brand' ? (
        <>
          <span className="logo">{brand.name}</span>
          <button type="button" className="x" aria-label={t('auth.close')} onClick={go}>✕</button>
        </>
      ) : (
        <>
          <button type="button" className="back" aria-label={t('auth.back')} onClick={go}>‹</button>
          <span className="ttl">{title}</span>
          {icon ? <IconTile className="auth_pagetopbar__ic" name="shield-check" size={28} round tone="mint" /> : null}
        </>
      )}
      <style jsx>{`
        .ptb { position: relative; z-index: 20; box-sizing: border-box; height: 55px; display: flex; align-items: center; padding: 0 12px; background: #1a1a21; }
        .ptb.is-back { border-bottom: 1px solid #2a2b31; }
        .ptb.is-brand { position: absolute; top: 0; left: 0; right: 0; align-items: flex-start; padding: 16px 13px 0 16px; background: transparent; }
        .logo { display: flex; align-items: center; justify-content: center; box-sizing: border-box; width: 107px; height: 34px; border: 1px dashed #3a3d44; border-radius: 6px; color: #c4c8d0; font-size: 12px; font-weight: 700; }
        .x { margin-left: auto; padding: 0; border: 0; background: none; color: #fff; font-size: 20px; line-height: 34px; cursor: pointer; }
        .back { width: 20px; margin-right: 12px; padding: 0; border: 0; background: none; color: #fff; font-size: 26px; line-height: 1; cursor: pointer; }
        .ttl { flex: 1; min-width: 0; color: #fff; font-size: 16px; font-weight: 700; }
        :global(.auth_pagetopbar__ic) { flex: none; }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
