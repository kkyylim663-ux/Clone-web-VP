import Icon from './Icon'
import type { IconName } from './icon-paths'

// 图标块：给列表行、标题旁、选择器里的小图标用，占位大小与原来的 SkImg 一致（size = 块的边长，px）。
// tone：muted 是灰底灰图标，mint 是薄荷色（强调）；bare 去掉底色只留图标；round 圆形，否则用 radius 圆角。
interface Props { name: IconName, size: number, icon?: number, round?: boolean, radius?: number, solid?: boolean, bare?: boolean, tone?: 'muted' | 'mint', className?: string }

export default function IconTile({ name, size, icon, round, radius = 8, solid, bare, tone = 'muted', className }: Props) {
  const mint = tone === 'mint'
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', width: size, height: size,
        borderRadius: round ? '50%' : radius,
        background: bare ? 'transparent' : mint ? 'rgba(var(--fx-mint-rgb), .14)' : 'rgba(255, 255, 255, .08)',
        color: mint ? 'var(--fx-mint)' : 'var(--fx-icon)',
      }}
    >
      <Icon name={name} size={icon ?? Math.max(12, Math.round(size * 0.58))} solid={solid} />
    </span>
  )
}
