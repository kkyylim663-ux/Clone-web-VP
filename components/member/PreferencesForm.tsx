'use client'
// 偏好设置（/preferences）：三组各自独立 Save（Privacy / Community / Marketing）。
// 存储：localStorage 键 vp_prefs，结构 { privacy: {...}, community: {...}, marketing: {...} }；刷新后仍保留。
// 提示「最多 30 秒生效」（参考站文案）。接口不参与（纯本地偏好）。
import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import SkStatus from '@/components/skeleton/browse/SkStatus'
import SkBox from '@/components/ui/SkBox'
import { MemberFrame, MemberInputStyles, useMemberState } from './shared'

const PREF_KEY = 'vp_prefs'
type Group = 'privacy' | 'community' | 'marketing'
const DEFAULTS: Record<Group, Record<string, boolean>> = {
  privacy: { ghost: false, hideStats: false, hideGames: false, hideProfile: false },
  community: { excludeRain: false },
  marketing: { email: false },
}
const GROUP_ITEMS: Record<Group, string[]> = {
  privacy: ['ghost', 'hideStats', 'hideGames', 'hideProfile'],
  community: ['excludeRain'],
  marketing: ['email'],
}

const readPrefs = (): Partial<Record<Group, Record<string, boolean>>> => {
  try { return JSON.parse(localStorage.getItem(PREF_KEY) ?? '{}') } catch { return {} }
}

export default function PreferencesForm() {
  const { t } = useLanguage()
  return <MemberFrame title={t('member.prefs.title')}><PrefsBody /></MemberFrame>
}

function PrefsBody() {
  const { t } = useLanguage()
  const { showToast } = useLayout()
  const { st } = useMemberState()
  const [vals, setVals] = useState<Record<Group, Record<string, boolean>>>(DEFAULTS)

  // 挂载后读取本地偏好（避免服务端与客户端首屏不一致）
  useEffect(() => {
    const saved = readPrefs()
    setVals({
      privacy: { ...DEFAULTS.privacy, ...saved.privacy },
      community: { ...DEFAULTS.community, ...saved.community },
      marketing: { ...DEFAULTS.marketing, ...saved.marketing },
    })
  }, [])

  if (st === 'loading') return <><SkBox h={168} state={t('member.common.loading')} className="member_preferencesform__pf-skel" /><SkBox h={112} state={t('member.common.loading')} className="member_preferencesform__pf-skel" /></>
  if (st === 'error') return <SkStatus kind="error" h={240} className="member_preferencesform__pf-st" />
  if (st === 'empty') return <SkStatus kind="empty" title={t('member.prefs.noItems')} hint="" h={240} className="member_preferencesform__pf-st" />

  const toggle = (g: Group, k: string) => setVals((x) => ({ ...x, [g]: { ...x[g], [k]: !x[g][k] } }))

  // 各组独立保存：只写本组，其它组保持已存值
  const save = (g: Group) => {
    try {
      const all = readPrefs()
      all[g] = vals[g]
      localStorage.setItem(PREF_KEY, JSON.stringify(all))
      showToast(t('member.toast.saved'))
    } catch {
      showToast(t('member.err.generic'))
    }
  }

  return (
    <div className="pf-wrap">
      {(['privacy', 'community', 'marketing'] as Group[]).map((g) => (
        <section key={g} className="pf-card" aria-label={t(`member.prefs.group.${g}`)}>
          <div className={`pf-gtitle${g === 'privacy' ? '' : ' pf-gtitle--s'}`}>
            <span>{t(`member.prefs.group.${g}`)}</span>
            {g === 'privacy' && <p className="pf-gdesc">{t('member.prefs.gdesc.privacy')}</p>}
          </div>
          {GROUP_ITEMS[g].map((k) => (
            <div key={k} className={`pf-row${g === 'privacy' ? '' : ' pf-row--s'}${k === 'hideGames' || k === 'hideProfile' ? ' pf-row--2' : ''}`}>
              <div className="pf-txt">
                <span className="pf-label">{t(`member.prefs.item.${k}`)}</span>
                <p className="pf-desc">{t(`member.prefs.desc.${k}`)}</p>
              </div>
              <button type="button" role="switch" aria-checked={vals[g][k]} aria-label={t(`member.prefs.item.${k}`)} className={`pf-switch${vals[g][k] ? ' on' : ''}`} onClick={() => toggle(g, k)}><i /></button>
            </div>
          ))}
          <div className={`pf-foot${g === 'marketing' ? ' pf-foot--s' : ''}`}>
            <p className="pf-hint">{t('member.prefs.hint')}</p>
            <button type="button" className="m-btn pf-btn" onClick={() => save(g)}>{t('member.common.save')}</button>
          </div>
        </section>
      ))}

      <MemberInputStyles />
      <style jsx>{`
        :global(.member_preferencesform__pf-skel) { width: calc(100% - 16px); margin: 8px; }
        :global(.member_preferencesform__pf-st) { margin: 8px; }
        .pf-wrap { padding: 16px 8px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px; }
        /* 卡高推导（参考站）：隐私 = 组头 70 + 行 64+64+70+70 + 底栏间距 12 + 底栏 45 + 下缘 6 = 401；社区 = 37 + 56 + 12 + 45 + 6 = 156；营销 = 37 + 56 + 12 + 41 + 6 = 152 */
        .pf-card { border-radius: 8px; background: var(--vp-card); overflow: hidden; padding-bottom: 6px; box-sizing: border-box; }
        /* 版式按 docs/research/vp/MEMBER-GEOMETRY.md（/preferences）：组头 70（隐私）/ 37（社区、营销），标题 16/500 距左 12；选项行 64（社区与营销 56），每项有说明；开关 40×20 r16；底栏 45（营销 41），Save 为文字按钮 16/500 */
        .pf-gtitle { height: 70px; box-sizing: border-box; display: flex; flex-direction: column; gap: 3px; padding: 10px 12px 0; font-size: 16px; font-weight: 500; color: #fff; }
        .pf-gtitle--s { height: 37px; padding-top: 6px; }
        .pf-gdesc { margin: 0; color: #8d8d92; font-size: 12px; font-weight: 400; line-height: 17px; }
        .pf-row { min-height: 64px; height: auto; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-top: 1px solid #2c2f36; }
        .pf-row--s { min-height: 56px; }
        .pf-row--2 { min-height: 70px; }
        .pf-txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .pf-desc { margin: 0; max-width: 271px; color: #8d8d92; font-size: 12px; font-weight: 400; line-height: 17px; }
        .pf-label { color: #fff; font-size: 16px; font-weight: 500; }
        .pf-switch { position: relative; flex: none; width: 40px; height: 20px; padding: 0; border: 0; border-radius: 16px; background: #3a3d44; cursor: pointer; }
        .pf-switch i { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #c4c8d0; transition: left .2s; }
        .pf-switch.on { background: var(--vp-primary); }
        .pf-switch.on i { left: 22px; }
        .pf-foot { margin-top: 12px; height: 45px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 0 35px 0 12px; }
        .pf-foot--s { height: 41px; }
        .pf-hint { margin: 0; width: 229px; color: #8d8d92; font-size: 12px; }
        .pf-btn { flex: none; width: auto; height: auto; padding: 0; border: 0; background: transparent; color: var(--vp-primary); font-size: 16px; font-weight: 500; cursor: pointer; }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
