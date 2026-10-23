'use client'
import { useEffect, useState } from 'react'
import HomePage from '@/app/page'

// 网页版弹窗页（登录/注册/忘记密码/条款/隐私）：弹窗后面是真实首页（browse 组的 app/page.tsx），不可交互。
// 首页里有读浏览器本地存储的内容（最近玩 / 收藏），服务端渲染和浏览器首次渲染会对不上（React #418），
// 所以只在页面挂载之后再渲染它；弹窗本身不受影响。
export default function HomeBehind() {
  const [ready, setReady] = useState(false)
  useEffect(() => { setReady(true) }, [])
  return (
    <div className="home-behind" aria-hidden="true">
      {ready ? <HomePage /> : null}
      <style jsx>{`
        .home-behind { pointer-events: none; user-select: none; }
      `}</style>
    </div>
  )
}
