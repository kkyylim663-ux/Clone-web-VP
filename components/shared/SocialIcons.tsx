// 三个社交 / 下载入口图标（Google、Telegram、App）：自绘 SVG，圆形深色底。接口未接，点击不跳转。
const G = (
  <svg width="26" height="26" viewBox="0 0 48 48" aria-label="Google"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.4-4.7 7l7.3 5.7c4.3-4 6.8-9.9 6.8-17.2z" /><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2 1.4-4.9 2.3-8.6 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" /></svg>
)
const TG = (
  <svg width="30" height="30" viewBox="0 0 24 24" aria-label="Telegram"><circle cx="12" cy="12" r="12" fill="#229ED9" /><path fill="#fff" d="M5.4 11.9l11.1-4.3c.5-.2 1 .1.8.9l-1.9 8.9c-.1.6-.5.8-1 .5l-2.9-2.1-1.4 1.4c-.2.2-.3.3-.6.3l.2-3 5.4-4.9c.2-.2 0-.3-.4-.1l-6.7 4.2-2.9-.9c-.6-.2-.6-.6.1-.9z" /></svg>
)
const APP = (
  <svg width="26" height="26" viewBox="0 0 24 24" aria-label="App"><rect x="5" y="2" width="14" height="20" rx="3" fill="none" stroke="#c4c8d0" strokeWidth="1.8" /><rect x="9.5" y="17" width="5" height="2.6" rx="1.3" fill="#c4c8d0" /></svg>
)

export default function SocialIcons({ className, size = 56 }: { className?: string, size?: number }) {
  return (
    <div className={`soc-ic ${className ?? ''}`.trim()} style={{ ['--ic' as string]: `${size}px` }}>
      <span>{G}</span>
      <span>{TG}</span>
      <span>{APP}</span>
      <style jsx>{`
        .soc-ic { display: flex; gap: 12px; }
        span :global(svg) { width: 46%; height: 46%; }
        span { display: flex; align-items: center; justify-content: center; width: var(--ic); height: var(--ic); border-radius: 50%; background: #26272d; cursor: pointer; transition: filter .2s ease; }
        span:hover { filter: brightness(1.2); }
      `}</style>
    </div>
  )
}
