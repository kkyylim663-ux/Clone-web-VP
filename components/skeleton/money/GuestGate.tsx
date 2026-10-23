'use client'
// 访客提示块（骨架占位，文字中性，无图片）。用于需要登录的页面与面板。
// source：来源页，写入 /login?page=；默认 wallet。体育投注页传 sport。
import { useGate, type GateSource } from '@/lib/useGate'

export default function GuestGate({ source = 'wallet' }: { source?: GateSource }) {
  const { enterLogin } = useGate()
  return (
    <div className="gg">
      <span className="gg-t">需要登录（占位）</span>
      <span className="gg-btn" onClick={() => enterLogin(source)}>登录</span>

      <style jsx>{`
        .gg { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 16px; padding: 16px 12px; box-sizing: border-box; border: 1px dashed #3a3d44; border-radius: 12px; background: #1d1f23; color: #8d8d92; font-size: 13px; }
        .gg-btn { flex: none; height: 32px; line-height: 32px; padding: 0 14px; border-radius: 8px; background: var(--vp-primary, var(--vp-primary)); color: var(--vp-on-primary); font-weight: 600; cursor: pointer; }
      `}</style>
    </div>
  )
}
