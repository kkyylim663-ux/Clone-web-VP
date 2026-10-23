// 奖池配图：封面 v-05 / v-06 / v-07 各取不同裁切与色调，奖池列表卡与奖池详情横幅共用，保证从哪张卡进入就看到哪张图。
export const POOL_ART: Record<string, { src: string, size: string, pos: string, tint: string, delay: string }> = {
  A: { src: '/assets/covers/v-05.webp', size: 'cover', pos: '50% 10%', tint: 'linear-gradient(90deg, rgba(8, 12, 18, .88) 0%, rgba(8, 12, 18, .45) 55%, rgba(150, 90, 10, .22) 100%)', delay: '0s' },
  B: { src: '/assets/covers/v-06.webp', size: 'cover', pos: '50% 12%', tint: 'linear-gradient(90deg, rgba(6, 16, 20, .88) 0%, rgba(6, 16, 20, .45) 55%, rgba(10, 130, 120, .25) 100%)', delay: '1.6s' },
  C: { src: '/assets/covers/v-07.webp', size: 'cover', pos: '50% 8%', tint: 'linear-gradient(90deg, rgba(14, 10, 24, .9) 0%, rgba(14, 10, 24, .45) 55%, rgba(110, 50, 170, .28) 100%)', delay: '3.2s' }
}
