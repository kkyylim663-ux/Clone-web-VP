// 活动详情弹窗内容（占位，后续由后台下发）。每个活动一份：横幅图、明细表、规则、按钮文案与去向。
export interface PromoContent {
  img: string, head: string[], rows: string[][], rules: string[], cta: string,
  to?: string, // 不填 = 打开存款
  games?: boolean,
}
type L = 'zh' | 'en'
const D: Record<string, Record<L, PromoContent>> = {
  first5: {
    zh: { img: 'first5-desktop', head: ['存款', '奖励比例', '流水'], rows: [['第 1 笔', '+50%', 'x15'], ['第 2 笔', '+60%', 'x15'], ['第 3 笔', '+70%', 'x15'], ['第 4 笔', '+50%', 'x15'], ['第 5 笔', '+50%', 'x15']], rules: ['仅限新会员，前 5 笔存款依次享受对应比例奖励。', '奖励自动发放，需完成流水后方可提现。', '同一设备、IP 或银行账户只能参与一次。', '平台保留本活动的最终解释权。'], cta: '立即存款' },
    en: { img: 'first5-desktop', head: ['Deposit', 'Bonus', 'Turnover'], rows: [['1st', '+50%', 'x15'], ['2nd', '+60%', 'x15'], ['3rd', '+70%', 'x15'], ['4th', '+50%', 'x15'], ['5th', '+50%', 'x15']], rules: ['New members only. Your first 5 deposits each earn the bonus shown.', 'Bonuses are credited automatically; complete the turnover before withdrawing.', 'One claim per device, IP or bank account.', 'The platform reserves the right of final interpretation.'], cta: 'Deposit now' },
  },
  daily: {
    zh: { img: 'card-daily-rebate', head: ['日投注额', '返水比例', '流水'], rows: [['0 – 1,000', '0.3%', 'x1'], ['1,000 – 10,000', '0.5%', 'x1'], ['10,000 – 50,000', '0.8%', 'x1'], ['50,000+', '1.0%', 'x1']], rules: ['每天投注，次月 1 号统一领取返水。', '返水按有效投注额计算，不含平局与取消注单。', '领取后需 1 倍流水方可提现。'], cta: '立即投注', to: '/casino', games: true },
    en: { img: 'card-daily-rebate', head: ['Daily bets', 'Rebate', 'Turnover'], rows: [['0 – 1,000', '0.3%', 'x1'], ['1,000 – 10,000', '0.5%', 'x1'], ['10,000 – 50,000', '0.8%', 'x1'], ['50,000+', '1.0%', 'x1']], rules: ['Bet daily and claim your rebate on the 1st of next month.', 'Calculated on valid bets only; ties and voided bets excluded.', '1x turnover required before withdrawing.'], cta: 'Bet now', to: '/casino', games: true },
  },
  special: {
    zh: { img: 'card-special', head: ['首存金额', '奖金比例', '流水'], rows: [['10 – 100', '100%', 'x15'], ['100 – 500', '120%', 'x15'], ['500 – 2,000', '150%', 'x20'], ['2,000+', '200%', 'x20']], rules: ['新会员注册后首次存款即可领取。', '奖金上限与流水以所选档位为准。', '每位玩家限领一次。'], cta: '立即存款' },
    en: { img: 'card-special', head: ['First deposit', 'Bonus', 'Turnover'], rows: [['10 – 100', '100%', 'x15'], ['100 – 500', '120%', 'x15'], ['500 – 2,000', '150%', 'x20'], ['2,000+', '200%', 'x20']], rules: ['Available on your first deposit after registering.', 'Bonus cap and turnover depend on the tier.', 'One claim per player.'], cta: 'Deposit now' },
  },
  spin: {
    zh: { img: 'card-free-spins', head: ['邀请好友', '获得旋转', '有效期'], rows: [['1 人', '1 次', '3 天'], ['3 人', '3 次', '3 天'], ['5 人', '6 次', '3 天'], ['10 人', '15 次', '3 天']], rules: ['邀请好友注册即可获得免费旋转次数。', '转盘奖励累计满 MYR 18.00 即可兑现。', '次数与奖励 3 天内未使用将过期。'], cta: '去旋转', to: '/freeSpin' },
    en: { img: 'card-free-spins', head: ['Friends invited', 'Spins', 'Valid for'], rows: [['1', '1 spin', '3 days'], ['3', '3 spins', '3 days'], ['5', '6 spins', '3 days'], ['10', '15 spins', '3 days']], rules: ['Invite friends to sign up and earn free spins.', 'Cash out once your winnings reach MYR 18.00.', 'Unused spins and winnings expire after 3 days.'], cta: 'Spin now', to: '/freeSpin' },
  },
  rescue: {
    zh: { img: 'card-rescue', head: ['周亏损', '救援比例', '流水'], rows: [['100 – 1,000', '5%', 'x1'], ['1,000 – 5,000', '8%', 'x1'], ['5,000 – 20,000', '10%', 'x1'], ['20,000+', '12%', 'x1']], rules: ['按每周净亏损计算，每周一自动发放。', '净亏损为存款减提款后的差额。', '领取后需 1 倍流水方可提现。'], cta: '立即存款', games: true },
    en: { img: 'card-rescue', head: ['Weekly loss', 'Rescue', 'Turnover'], rows: [['100 – 1,000', '5%', 'x1'], ['1,000 – 5,000', '8%', 'x1'], ['5,000 – 20,000', '10%', 'x1'], ['20,000+', '12%', 'x1']], rules: ['Based on weekly net loss, credited every Monday.', 'Net loss = deposits minus withdrawals.', '1x turnover required before withdrawing.'], cta: 'Deposit now', games: true },
  },
  vip: {
    zh: { img: 'card-vip', head: ['等级', '升级礼金', '月礼金'], rows: [['VIP 1', '10', '5'], ['VIP 2', '30', '15'], ['VIP 3', '100', '50'], ['VIP 4', '300', '150']], rules: ['累计有效投注达标后自动升级。', '升级礼金一次性发放，月礼金每月 1 号发放。'], cta: '查看 VIP', to: '/vip' },
    en: { img: 'card-vip', head: ['Level', 'Level-up', 'Monthly'], rows: [['VIP 1', '10', '5'], ['VIP 2', '30', '15'], ['VIP 3', '100', '50'], ['VIP 4', '300', '150']], rules: ['Level up automatically once your valid bets qualify.', 'Level-up bonus is one-off; monthly bonus is paid on the 1st.'], cta: 'View VIP', to: '/vip' },
  },
  refer: {
    zh: { img: 'card-refer', head: ['推荐人数', '每人奖励', '佣金'], rows: [['1 – 5', '10', '0.5%'], ['6 – 20', '15', '0.8%'], ['21 – 50', '20', '1.0%'], ['51+', '30', '1.5%']], rules: ['好友通过你的链接注册并首存即算有效推荐。', '佣金按好友有效投注实时结算。'], cta: '去推荐', to: '/refer-earn' },
    en: { img: 'card-refer', head: ['Referrals', 'Per friend', 'Commission'], rows: [['1 – 5', '10', '0.5%'], ['6 – 20', '15', '0.8%'], ['21 – 50', '20', '1.0%'], ['51+', '30', '1.5%']], rules: ['A referral counts once your friend signs up via your link and deposits.', 'Commission is settled in real time on their valid bets.'], cta: 'Refer now', to: '/refer-earn' },
  },
}
export const promoContentKey = (category: string) => (D[category] ? category : category === 'welcome' ? 'special' : 'daily')
export const getPromoContent = (key: string, lang: string): PromoContent => D[key][lang.startsWith('zh') ? 'zh' : 'en']
