'use client'

// 登录 / 注册弹窗左侧宣传图（426×638）：auth/side.webp 铺满，cover 裁切。
export default function AuthSidePromo() {
  return (
    <div className="sp">
      <img src="/assets/auth/side.webp" alt="" />
      <style jsx>{`
        .sp { position: relative; width: 426px; height: 638px; overflow: hidden; }
        img { display: block; width: 100%; height: 100%; object-fit: cover; }
      `}</style>
    </div>
  )
}
