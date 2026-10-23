'use client'
// 奖池「Bonus Share」分享弹窗（参考站：点奖池页 / 奖池详情的 Share，弹窗叠在当前页上，不跳页面）。
// 版式取自参考站截图：标题栏 + ✕、霓虹标题牌、紫色展示屏（今日第 N 位幸运者 / 金额 / By）、底部绿色 Share 按钮。
// 图片与字样均为自有占位（不用参考站吉祥物与 Logo）。Share：优先系统分享，其次复制链接并提示。
import { useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import { useModalMotion } from '@/lib/useModalMotion'
import { usePromoData } from '@/components/promo/usePromoData'

interface Share { rank: number, amount: string, currency: string }

export default function BonusShareModal() {
  const { t } = useLanguage()
  const { shareOpen, setShareOpen, showToast } = useLayout()
  const { mounted, shown } = useModalMotion(shareOpen)
  const { data } = usePromoData<{ list: Share[] }>('/api/web/promo/jackpotGameShare')
  const win = data?.list?.[0]
  const close = () => setShareOpen(false)

  useEffect(() => {
    if (!shareOpen) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setShareOpen(false) }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [shareOpen, setShareOpen])

  const share = async () => {
    const url = `${window.location.origin}/jackpot`
    try {
      if (navigator.share) { await navigator.share({ title: t('jackpot.bs.title'), url }); return }
      await navigator.clipboard.writeText(url)
      showToast(t('jackpot.copied'))
    } catch { showToast(t('jackpot.copyFail')) }
  }

  if (!mounted) return null
  return (
    <div className={`bs-back mo-overlay${shown ? ' on' : ''}`} onClick={close}>
      <div className={`bs-box mo-modal-enter-active${shown ? '' : ' mo-modal-enter-from'}`} role="dialog" aria-modal="true" aria-label={t('jackpot.bs.title')} onClick={(e) => e.stopPropagation()}>
        <header className="bs-hd">
          <h3>{t('jackpot.bs.title')}</h3>
          <span className="bs-x" role="button" tabIndex={0} aria-label={t('promotion.modal.close')} onClick={close}>✕</span>
        </header>
        <div className="bs-body">
          <div className="bs-sign"><b>{t('jackpot.bs.sign')}</b><small>{t('jackpot.bs.signSub')}</small></div>
          <div className="bs-machine">
            <div className="bs-screen">
              <p>{t('jackpot.bs.lucky', { n: win ? win.rank : 0 })}</p>
              <b>{win ? `${win.currency} ${win.amount}` : 'MYR 0'}</b>
            </div>
            <span className="bs-by">{t('jackpot.bs.by')}</span>
          </div>
          <div className="bs-plinth">
            <button type="button" className="bs-share" onClick={share}><i>↪</i>{t('jackpot.bs.share')}</button>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .bs-back { position: fixed; inset: 0; z-index: 95; background: rgba(0, 0, 0, .65); display: flex; align-items: center; justify-content: center; padding: 12px; }
        .bs-box { position: relative; width: min(345px, 100%); height: min(640px, calc(100dvh - 40px)); display: flex; flex-direction: column; border-radius: 24px; overflow: hidden; background: radial-gradient(120% 80% at 50% 30%, #3a2457 0%, #1a1424 70%); border: 1px solid rgba(255, 255, 255, .08); color: #fff; }
        .bs-hd { position: relative; height: 56px; flex: none; display: flex; align-items: center; justify-content: center; }
        .bs-hd h3 { margin: 0; font-size: 18px; font-weight: 500; }
        .bs-x { position: absolute; right: 14px; top: 14px; width: 28px; height: 28px; text-align: center; line-height: 28px; font-size: 22px; cursor: pointer; }
        .bs-body { position: relative; flex: 1; padding: 0 14px 12px; display: flex; flex-direction: column; align-items: center; }
        .bs-sign { width: 100%; padding: 14px 10px; border-radius: 16px; text-align: center; background: linear-gradient(#2a1d4a, #1b1233); border: 2px solid #6a4fb0; box-shadow: 0 0 18px rgba(138, 92, 255, .35); }
        .bs-sign b { display: block; font-size: 30px; line-height: 1; font-weight: 800; letter-spacing: 1px; color: #ff6fd8; text-shadow: 0 0 10px rgba(255, 111, 216, .7); }
        .bs-sign small { display: block; margin-top: 8px; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #3df2b0; text-shadow: 0 0 8px rgba(61, 242, 176, .6); }
        .bs-machine { position: relative; width: 100%; margin-top: 10px; padding: 14px 12px 26px; border-radius: 20px; background: linear-gradient(#5b3b8c, #2a1b4a); border: 2px solid #7b5bbd; }
        .bs-screen { padding: 16px 10px 20px; border-radius: 10px; text-align: center; background: linear-gradient(#7a2b8e, #4a1a66); border: 1px solid rgba(255, 140, 255, .5); box-shadow: inset 0 0 18px rgba(255, 100, 255, .35); }
        .bs-screen p { margin: 0; font-size: 15px; font-weight: 700; color: #ffe9b8; }
        .bs-screen b { display: block; margin-top: 6px; font-size: 32px; font-weight: 800; color: #f6c96a; text-shadow: 0 0 12px rgba(246, 201, 106, .5); font-variant-numeric: tabular-nums; }
        .bs-by { position: absolute; left: 50%; bottom: -1px; transform: translateX(-50%); min-width: 130px; height: 22px; line-height: 22px; text-align: center; border-radius: 12px 12px 0 0; background: #1b1233; font-size: 12px; font-weight: 700; color: #cbbfe6; }
        .bs-plinth { position: absolute; left: -2px; right: -2px; bottom: 0; height: 130px; display: flex; align-items: center; justify-content: center; clip-path: polygon(6% 0, 94% 0, 100% 100%, 0 100%); background: linear-gradient(#4a3a6a, #2a2040); }
        .bs-share { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 282px; height: 56px; border: 0; border-radius: 28px; background: linear-gradient(#6dffd0, #1fdc78); color: #07210f; font-size: 20px; font-weight: 800; cursor: pointer; box-shadow: 0 6px 0 #0f6b4a, 0 0 22px rgba(61, 242, 176, .45); }
        .bs-share i { font-style: normal; font-size: 22px; }
        .bs-share:active { transform: translateY(2px); box-shadow: 0 4px 0 #0f6b4a, 0 0 16px rgba(61, 242, 176, .4); }
      `}</style>
    </div>
  )
}
