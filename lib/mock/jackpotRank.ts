// 奖池排行榜 mock（对应接口 jackpot ranking；字段形状与后端一致：rank、昵称、投注积分、奖金、占比）。name 为 '?' 表示隐藏身份（前端显示「神秘玩家」）。
export interface RankRow { rank: number, name: string, points: string, amount: string, pct: string }

export const RANK_POOL = '2072.85'
export const RANK_GAMES = 2814
export const RANK_ROWS: RankRow[] = [
  { rank: 1, name: 'fariya56', points: '2982.03', amount: '4.93', pct: '12.00%' },
  { rank: 2, name: '?', points: '2386.58', amount: '2.69', pct: '6.50%' },
  { rank: 3, name: 'User106PX3kO', points: '1126.66', amount: '1.38', pct: '3.40%' },
  { rank: 4, name: '?', points: '1089.64', amount: '1.14', pct: '2.80%' },
  { rank: 5, name: 'User103alGpQ', points: '1077.60', amount: '1.01', pct: '2.50%' },
  { rank: 6, name: 'SAKHAWAT', points: '951.23', amount: '0.85', pct: '2.10%' },
  { rank: 7, name: '?', points: '890.10', amount: '0.80', pct: '2.00%' },
  { rank: 8, name: 'User88Qx21', points: '812.45', amount: '0.74', pct: '1.80%' },
  { rank: 9, name: 'Lina_77', points: '760.00', amount: '0.66', pct: '1.60%' },
  { rank: 10, name: 'User420Zk', points: '701.32', amount: '0.58', pct: '1.40%' }
]
