'use client'
import ForgotFlow from '@/components/auth/ForgotFlow'
import { useViewport } from '@/lib/useViewport'

// 忘记密码（bare 外壳）：手机整页 + 网页小弹窗（373×264），两种版式共用 ForgotFlow 的 3 步逻辑。
export default function ForgotPage() {
  const vp = useViewport()
  return (
    <>
      {vp !== 'd' && <ForgotFlow variant="page" />}
      {vp !== 'm' && <ForgotFlow variant="modal" />}
    </>
  )
}
