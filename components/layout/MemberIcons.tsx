// 个人菜单图标：沿用侧栏同一套 Icon（24 视窗、1.75 描边、实心主体 + --fx-cut 刻线、颜色跟随文字），
// 头像下拉菜单与个人页左侧导航共用；k 是菜单项键。
import Icon from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/icon-paths'

const NAME: Record<string, IconName> = {
  account: 'm_account', security: 'm_security', kyc: 'm_kyc', bets: 'm_bets',
  sessions: 'm_sessions', ignored: 'm_ignored', preferences: 'm_prefs', logout: 'm_logout'
}

export default function MemberIcon({ k, size = 22 }: { k: string, size?: number }) {
  return <Icon name={NAME[k]} size={size} solid />
}
