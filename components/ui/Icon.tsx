import { ICONS, SOLID, type IconName } from './icon-paths'

// 全站线性图标。颜色跟随文字色（currentColor），尺寸默认 20，描边 1.75。
// 用法：<Icon name="vip" />、<Icon name="bell" size={22} />。纯装饰图标不传 title（读屏跳过）；有语义时传 title。
// solid：用实心版本（导航图标默认就是实心，选中靠荧光；没有实心版本的图标仍是线性）。
interface Props { name: IconName, size?: number, strokeWidth?: number, className?: string, title?: string, solid?: boolean }

export default function Icon({ name, size = 20, strokeWidth = 1.75, className, title, solid }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-label={title}
      dangerouslySetInnerHTML={{ __html: (solid && SOLID[name]) || ICONS[name] }}
    />
  )
}
