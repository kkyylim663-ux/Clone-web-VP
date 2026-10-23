import SkBox from '@/components/ui/SkBox'

// 切页时内容区先显示骨架（顶栏、侧栏保持不动），不再停在旧页面上
export default function Loading() {
  return (
    <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SkBox h={320} />
      <SkBox h={120} />
      <SkBox h={200} />
    </div>
  )
}
