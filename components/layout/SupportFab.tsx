'use client'
// 浮动客服按钮 + 在线客服弹窗：参考站桌面端为右上角悬浮面板（绿色头部 / 常见问题 / 转人工 / 输入框），手机端全屏。
// 弹窗内容为自有占位；对话为本地演示（发送后追加气泡 + 占位回复），真实客服接入后替换。
// 弹窗过渡 .mo-modal（scale+fade，文档 interactions.md 桌面 c）；右下按钮 right 过渡 var(--mo-float)。
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import { useModalMotion } from '@/lib/useModalMotion'

interface Msg { from: 'me' | 'bot', text: string }
const FAQ = [1, 2, 3, 4, 5]

export default function SupportFab() {
  const { t } = useLanguage()
  // 与侧栏「在线客服」共用的状态
  const { supportOpen: open, setSupportOpen } = useLayout()
  const { mounted, shown } = useModalMotion(open)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const [faqPage, setFaqPage] = useState(0)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight }) }, [msgs])
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setSupportOpen(false) }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, setSupportOpen])

  const send = (v: string) => {
    const s = v.trim()
    if (!s) return
    setMsgs((m) => [...m, { from: 'me', text: s }])
    setText('')
    setTimeout(() => setMsgs((m) => [...m, { from: 'bot', text: t('base.shell.chat.autoReply') }]), 600)
  }
  const faqIds = FAQ.map((n) => ((n - 1 + faqPage * 2) % FAQ.length) + 1)

  return (
    <div>
      <button className="fab" aria-label="support" onClick={() => setSupportOpen(true)}>💬</button>
      {mounted && (
        <div className={`panel mo-modal-enter-active${shown ? '' : ' mo-modal-enter-from'}`} role="dialog" aria-label={t('base.shell.chat.title')}>
          <header className="hd">
            <span className="back" role="button" tabIndex={0} onClick={() => setSupportOpen(false)}>‹ {t('base.shell.chat.back')}</span>
            <span className="agent"><i className="ico">🎧</i>#{t('base.shell.chat.ticket')}</span>
            <span className="lang">{t('base.shell.chat.lang')} ⌄</span>
          </header>
          <div className="body" ref={bodyRef}>
            <div className="who"><i className="av" /><small>{t('base.shell.chat.agent')}</small></div>
            <div className="card">
              <p className="ask"><i className="ico2">✦</i>{t('base.shell.chat.ask')}</p>
              <ul>
                {faqIds.map((n) => (
                  <li key={n} role="button" tabIndex={0} onClick={() => send(t(`base.shell.chat.faq${n}`))}>
                    <span>{t(`base.shell.chat.faq${n}`)}</span><i>›</i>
                  </li>
                ))}
              </ul>
              <span className="chg" role="button" tabIndex={0} onClick={() => setFaqPage((p) => p + 1)}>↻ {t('base.shell.chat.change')}</span>
            </div>
            {msgs.map((m, i) => <div key={i} className={`msg ${m.from}`}>{m.text}</div>)}
          </div>
          <footer className="ft">
            <span className="agentbtn" role="button" tabIndex={0} onClick={() => send(t('base.shell.chat.transfer'))}>🎧 {t('base.shell.chat.transfer')}</span>
            <form className="inp" onSubmit={(e) => { e.preventDefault(); send(text) }}>
              <i className="pic">▣</i>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t('base.shell.chat.ph')} />
              <button type="submit" aria-label="send">➤</button>
            </form>
          </footer>
        </div>
      )}

      <style jsx>{`
        /* 手机：右侧悬浮，直径 40，贴右缘半隐，位于底部 tab 上方；网页：右下角 44 */
        .fab { position: fixed; right: -12px; bottom: 100px; z-index: 25; width: 40px; height: 40px; box-sizing: border-box; padding: 0; border: 0; border-radius: 50%; background: var(--vp-grad); color: var(--vp-on-primary); display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 14px rgba(0, 0, 0, .4); cursor: pointer; transition: right var(--mo-float); }
        .fab:focus-visible { outline: 2px solid var(--vp-primary); outline-offset: 2px; }
        @media (min-width: 768px) { .fab { right: 24px; bottom: 24px; width: 44px; height: 44px; font-size: 20px; } }

        .panel { position: fixed; z-index: 95; inset: 0; display: flex; flex-direction: column; background: #f3f6f5; color: #1a1d21; overflow: hidden; }
        @media (min-width: 768px) { .panel { inset: auto 20px 20px auto; top: 70px; width: 470px; border-radius: 16px; box-shadow: 0 12px 40px rgba(0, 0, 0, .5); } }
        .hd { display: flex; align-items: center; justify-content: space-between; gap: 12px; height: 80px; flex: none; padding: 0 16px; background: #0fbf6a; color: #fff; }
        .back { font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; }
        .agent { flex: 1; display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 600; }
        .ico { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; background: rgba(255, 255, 255, .25); font-style: normal; font-size: 22px; }
        .lang { padding: 6px 12px; border-radius: 6px; background: rgba(255, 255, 255, .2); font-size: 14px; white-space: nowrap; }
        .body { flex: 1; min-height: 0; overflow-y: auto; padding: 14px 12px; }
        .who { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .av { width: 36px; height: 36px; border-radius: 50%; background: #d8dfdc; }
        .who small { color: #6b7280; font-size: 13px; }
        .card { padding: 14px 16px; border-radius: 14px; background: #fff; box-shadow: 0 1px 4px rgba(0, 0, 0, .06); }
        .ask { display: flex; align-items: center; gap: 8px; margin: 0 0 6px; font-size: 18px; font-weight: 600; }
        .ico2 { display: inline-flex; width: 30px; height: 30px; align-items: center; justify-content: center; border-radius: 8px; background: #e3f6ec; color: #0fbf6a; font-style: normal; }
        ul { list-style: none; margin: 0; padding: 0; background: #eef9f3; border-radius: 10px; }
        li { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 14px 14px; font-size: 16px; cursor: pointer; border-bottom: 1px solid #fff; }
        li:last-child { border-bottom: 0; }
        li i { color: #0fbf6a; font-style: normal; font-size: 20px; }
        .chg { display: block; margin-top: 10px; text-align: right; color: #6b7280; font-size: 14px; cursor: pointer; }
        .msg { max-width: 80%; margin-top: 10px; padding: 10px 14px; border-radius: 12px; font-size: 15px; line-height: 1.5; }
        .msg.me { margin-left: auto; background: #0fbf6a; color: #fff; }
        .msg.bot { background: #fff; }
        .ft { flex: none; padding: 10px 12px 14px; background: #fff; }
        .agentbtn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1px solid #0fbf6a; border-radius: 999px; background: #eef9f3; color: #0a8f4f; font-size: 14px; font-weight: 600; cursor: pointer; }
        .inp { display: flex; align-items: center; gap: 10px; margin-top: 10px; padding: 8px 10px; border-radius: 14px; background: #f3f6f5; }
        .pic { color: #6b7280; font-style: normal; }
        input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font-family: inherit; font-size: 15px; color: #1a1d21; }
        .inp button { width: 40px; height: 40px; border: 0; border-radius: 50%; background: #0fbf6a; color: #fff; font-size: 16px; cursor: pointer; }
      `}</style>
    </div>
  )
}
