'use client'
// 聊天室（对应 vp-web/app/pages/chat.vue）。消息为本地列表（不接后端）：已登录可发言，未登录发言走 guard('chat') → /login?page=chat（来源：文档 handlers-static §4）。
// 须知弹层按钮 → 登录：推断（参考站须知弹层的确认行为未实测）。
// ?state=: 空 = 未登录显示须知、已登录显示消息 | guest 须知 | member 消息列表 | loading | empty | error
import { Suspense, useEffect, useState, type KeyboardEvent } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useGate } from '@/lib/useGate'
import { cx } from '@/components/promo/util'
import SkImg from '@/components/ui/SkImg'
import SkBox from '@/components/ui/SkBox'
import SkStatus from '@/components/shared/SkStatus'

export default function Page() {
  return <Suspense fallback={null}><ChatPage /></Suspense>
}

const SEED_COUNT = 6
const RULE_LINES = [0, 1, 2, 3, 4, 5]

function ChatPage() {
  const sp = useSearchParams()
  const st = sp.get('state') ?? ''
  const { t } = useLanguage()
  const { loggedIn } = useAuth()
  const { back, guard, enterLogin } = useGate()
  const [draft, setDraft] = useState('')
  const [sent, setSent] = useState<string[]>([])
  // 须知「我知道了」：只关闭弹层，URL 不变；记在 sessionStorage（读写失败按未确认处理）
  const subpage = usePathname() === '/chat/subpage'
  const [rulesOk, setRulesOk] = useState(false)
  useEffect(() => {
    try { setRulesOk(sessionStorage.getItem('vp_chat_rules_ok') === '1') } catch { /* 无存储：不记忆 */ }
  }, [])
  const ackRules = () => {
    setRulesOk(true)
    try { sessionStorage.setItem('vp_chat_rules_ok', '1') } catch { /* 无存储：不记忆 */ }
  }

  const sheet = (st === 'guest' || (st === '' && !loggedIn)) && !rulesOk
  const seed = Array.from({ length: SEED_COUNT }, (_, i) => ({ key: `s${i}`, me: i % 3 === 2, text: t(`chat.seed.${i + 1}`) }))
  const msgs = [...seed, ...sent.map((text, i) => ({ key: `m${i}`, me: true, text }))]

  const send = () => {
    const text = draft.trim()
    if (!text) return
    setSent((s) => [...s, text])
    setDraft('')
  }
  const trySend = () => guard('chat', send)
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') trySend() }

  return (
    <div className="ct">
      <header className="ct-bar">
        <span className="ct-back" aria-hidden="true" onClick={back}>‹</span>
        <span className="ct-name">{sp.get('room') || (subpage ? t('chat.roomGlobal') : t('chat.title'))}</span>
        <span className="ct-count">{msgs.length}</span>
      </header>

      <div className="ct-main">
        {st === 'loading' ? <SkBox state={t('status.loading')} className="chat_pg__ct-state" /> : null}
        {st === 'error' ? <SkStatus kind="error" h={240} /> : null}
        {st === 'empty' ? <SkStatus kind="empty" title={t('chat.emptyTitle')} hint="" h={240} /> : null}
        {!['loading', 'error', 'empty'].includes(st) && !sheet ? (
          <div className="ct-msgs">
            {msgs.map((m) => (
              <div key={m.key} className="ct-msg">
                <span className="ct-av" role="button" tabIndex={0} aria-label={t('chat.avatar')} onClick={() => guard('chat', () => {})} />
                <span className={cx('ct-bubble', m.me && 'me')}>{m.text}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="ct-input">
        <input
          className="ct-field"
          value={draft}
          placeholder={loggedIn ? t('chat.inputPh') : t('chat.loginPh')}
          onFocus={() => { if (!loggedIn) enterLogin('chat') }}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          aria-label={t('chat.inputPh')}
        />
        <button type="button" className="ct-send" aria-label={t('chat.send')} onClick={trySend} />
      </div>

      {sheet ? (
        <div className="ct-sheet">
          <span className="ct-sheet-t">{t('chat.rulesTitle')}</span>
          <div className="ct-rules">
            {RULE_LINES.map((n) => <span key={n} className="ct-line" style={{ width: `${60 + ((n * 37) % 30)}%` }} />)}
          </div>
          <button type="button" className="ct-ok" onClick={ackRules}>{t('chat.sheetBtn')}</button>
        </div>
      ) : null}

      <style jsx global>{`
        .ct { position: relative; min-height: 100%; height: 748px; background: #0b0b0d; color: #fff; font-size: 14px; box-sizing: border-box; overflow: visible; }
        .ct-bar { display: flex; align-items: center; gap: 10px; height: 48px; margin-top: 1px; padding: 0 12px; box-sizing: border-box; background: #14141a; }
        .ct-back { width: 24px; font-size: 26px; line-height: 1; cursor: pointer; }
        .ct-name { flex: 1; font-size: 16px; font-weight: 600; }
        .ct-count { min-width: 32px; height: 20px; line-height: 20px; text-align: center; border-radius: 999px; background: #1f2a24; color: var(--vp-primary); font-size: 12px; }
        .ct-main { padding: 12px; box-sizing: border-box; }
        :global(.chat_pg__ct-state) { width: 100%; height: 200px; }
        .ct-msgs { display: flex; flex-direction: column; gap: 12px; }
        .ct-msg { display: flex; align-items: flex-start; gap: 8px; }
        .ct-av { flex: none; width: 28px; height: 28px; border-radius: 50%; background: #2a2d33; cursor: pointer; }
        .ct-bubble { width: 60%; height: 36px; box-sizing: border-box; padding: 0 12px; line-height: 36px; border-radius: 12px; background: #1d1f25; color: #e5e7eb; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ct-bubble.me { margin-left: auto; background: #1b3a2c; }

        /* 底部输入条（位于弹层下方，移动端 758 起、高 56；弹层覆盖它） */
        .ct-input { position: absolute; left: 0; right: 0; top: 758px; height: 56px; box-sizing: border-box; padding: 8px 8px 0; display: flex; align-items: flex-start; gap: 6px; background: #14141a; }
        .ct-field { flex: 1; min-width: 0; height: 40px; padding: 0 16px; box-sizing: border-box; border: 0; outline: none; border-radius: 60px; background: #1d1f25; color: #fff; font-family: inherit; font-size: 14px; }
        .ct-field::placeholder { color: #6b7078; }
        .ct-send { flex: none; width: 42px; height: 42px; margin-top: -1px; padding: 0; border: 0; border-radius: 50%; background: var(--vp-primary); cursor: pointer; }

        /* 须知弹层（移动端：顶部 203 起，贴到页面底部 812；按钮 303×44，距底 50） */
        /* 弹层不拦截点击（pointer-events:none）：输入条可点；仅 .ct-ok 保留点击。 */
        .ct-sheet { position: absolute; left: 0; right: 0; bottom: -64px; top: 203px; box-sizing: border-box; border-radius: 16px 16px 0 0; background: #26262c; pointer-events: none; }
        .ct-sheet-t { display: block; padding-top: 24px; text-align: center; font-size: 16px; font-weight: 600; }
        .ct-rules { margin: 24px 16px 0; height: 211px; padding: 14px 12px; box-sizing: border-box; border-radius: 8px; background: #2e2e36; display: flex; flex-direction: column; gap: 12px; }
        .ct-line { display: block; height: 8px; border-radius: 4px; background: #3d4048; }
        .ct-ok { position: absolute; left: 36px; width: 303px; bottom: 50px; height: 44px; line-height: 44px; border: 0; padding: 0; border-radius: 22px; text-align: center; background: var(--vp-grad); color: var(--vp-on-primary); font-family: inherit; font-size: 14px; font-weight: 600; box-sizing: border-box; pointer-events: auto; cursor: pointer; }

        /* ---- 网页端（推断：弹层居中，宽 400） ---- */
        @media (min-width: 768px) {
          .ct { position: fixed; top: 0; right: 0; bottom: 0; left: 0; height: auto; }
          .ct-bar { margin-top: 0; }
          .ct-input { top: 744px; }
          .ct-field { flex: none; width: 315px; }
          .ct-send { margin-left: auto; }
          .ct-sheet { left: 0; right: 0; width: auto; transform: none; top: 200px; bottom: 0; height: auto; border-radius: 16px 16px 0 0; }
          .ct-ok { left: 36px; width: 303px; transform: none; bottom: 50px; }
          .ct-rules { margin: 24px 20px 0; }
        }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
