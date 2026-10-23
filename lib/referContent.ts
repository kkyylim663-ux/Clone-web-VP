// 推荐赚钱页的说明文案与表格数据（版式与数值取自参考站 /refer-earn，品牌词用 XXX 占位）。中英两套，按当前语言取。
export interface ReferText {
  inviteTop: string, inviteNow: string, teamTitle: string, teamSub: string, agentLevel: string, you: string
  teamRule: string, slotRule: string, fishRule: string, totalComm: string, totalExp: string
  betSlot: (n: string) => string, betFish: (n: string) => string, betAll: (n: string) => string
  commGen: string, expEarned: string, infNote: string[], infRight: string[], bullets: Array<Array<[string, boolean]>>
  depTitle: string, depSub: string, depLevel: string, depRatio: string, depNote: string
  comTitle: string, comSub: string, comRate: string, comLevel: string, comCats: string[], comNote: string
  faqTitle: string, faq: Array<{ q: string, a: string }>
  period: string[], teamData: string, allTeamData: string, dash: string
  stats: string[], dashCards: Array<{ h: string, cols: string[], vals: string[] }>
  searchPh: string, noData: string, details: string
}

const CAT_FACTOR = [1, 0.3, 0.3, 1, 0.5, 0.4, 0.4, 0.5, 0.3]
const BASE: number[][] = [
  [35, 10, 3, 1], [40, 15, 6, 3], [45, 20, 9, 5], [50, 25, 12, 7], [60, 30, 15, 9], [70, 35, 20, 12], [80, 40, 25, 15], [90, 50, 30, 18], [100, 60, 40, 20]
]
/** 某个游戏类别的返佣表（每万投注）：除“老虎机”外为按比例折算的占位值 */
export const commissionRows = (cat: number): number[][] => BASE.map((r) => r.map((v) => (cat === 0 ? v : Math.max(1, Math.round(v * CAT_FACTOR[cat])))))
export const DEPOSIT_RATIOS = ['0.2%', '0.5%', '1%', '1.5%', '2%', '2.5%', '3%', '4%', '5%']
export const EXP_NEED = ['40,784.24', '203.9K', '407.8K', '2M', '4M', '20.3M', '40.7M', '203.9M', 'Max']

const EN: ReferText = {
  inviteTop: 'Invite a friend to earn', inviteNow: 'INVITE NOW', teamTitle: 'Referral Team', teamSub: 'Earn more rewards as your referral network expands.',
  agentLevel: 'Agent Level:', you: 'YOU', teamRule: 'Team A, B, C, D Rebates based on game type.',
  slotRule: 'Slot (per 10k) = (35, 10, 3, 1)', fishRule: 'Fishing (per 10k) = (35, 10, 3, 1)',
  totalComm: 'Total Commission: 17.5+52.5+10+15+0.6+0.05=', totalExp: 'Total Agent EXP: 5,000+15,000+10,000+50,000+ 2,000+500+113,000=',
  betSlot: (n) => `Bet Amounts (slot only):${n}`, betFish: (n) => `Bet Amounts (Fishing only):${n}`, betAll: (n) => `Bet Amounts (All):${n}`,
  commGen: 'Commission Generated：', expEarned: 'Agent EXP Earned：',
  infNote: ['From Team E to Infinite Team,', 'earn 1 Agent EXP for every $1 bet.', 'bet amounts:100,000', 'Total Contribute Agent EXP for you:'],
  infRight: ['Agent EXP Earned from', 'Team E - Infinite Team', '10,000+100,000+3,000', '=113,000'],
  bullets: [
    [['Your direct subordinates will comprise ', false], ['Team A', true], ['.', false]],
    [['When members of ', false], ['Team A', true], [' invite their friends, these friends will comprise your ', false], ['Team B', true], ['. The composition rules for ', false], ['Team B', true], [' and the Infinite Team are the same.', false]],
    [['Earn commission from your referral teams (', false], ['Teams A–D', true], ['). The more they bet, the more you earn.', false]],
    [['Additionally, you can upgrade your agent level based on the performance of your entire team (', false], ['Team A through Infinite Team', true], ['). The higher your agent level, the greater your rebate amount.', false]],
    [['Commission is calculated based on eligible referral bets.', false]]
  ],
  depTitle: 'Deposit Bonus', depSub: 'Earn a percentage of every deposit made by your referrals. The higher your Agent Level, the higher your earning percentage.',
  depLevel: 'Agent Level', depRatio: 'Bonus Ratio', depNote: 'Single deposit of at least ',
  comTitle: 'Bet Commission', comSub: 'Grow your referral network and unlock higher reward rates. The higher your Agent Level, the more referral rewards you can earn.',
  comRate: 'Referral Commission Rate', comLevel: 'Agent Level',
  comCats: ['Slot', 'Live Casino', 'Sport', 'Fishing', 'Mini Game', 'Table Game', 'Lottery', 'Bingo', 'Cock Fighting'],
  comNote: 'All eligible bets from your referral network count toward Agent Level progression. The higher your Agent Level, the higher your referral commission rate.',
  faqTitle: 'FAQ',
  faq: [
    { q: 'How does the referral system work', a: 'Share your referral link with friends, family, and others. Anyone who registers on XXX through your link becomes part of your referral network. As your referral network grows and generates eligible bets, you’ll earn referral bonuses and commissions.' },
    { q: 'What’s my referral team?', a: 'Your direct invitees form Team A, their invitees form Team B, and so on through Team D. Everyone further down is the Infinite Team. Every level of the team contributes to your commission and Agent EXP.' },
    { q: 'What does Reward consist of?', a: 'Rewards come from three sources: a one-time referral bonus for each valid friend, a percentage of your referrals’ deposits, and a commission on their eligible bets.' },
    { q: 'Why didn’t my friends（direct subordinate） I invited become valid users?', a: 'A friend becomes a valid user only after registering through your link and completing the required deposit. Check that they used your link and met the minimum single deposit.' },
    { q: 'I have a large audience. How can I access special offers?', a: 'Contact customer support with your channel details. Our team will review your audience and discuss tailored partnership terms.' },
    { q: 'How can I upgrade my agent level?', a: 'Your Agent Level rises with the total eligible bets of your entire referral network. Once you reach the EXP shown for the next level, you upgrade automatically.' },
    { q: 'Why the amount of money available keeps changing?', a: 'Commission and bonuses are settled continuously as your referrals play and deposit, so the claimable amount updates in real time until you claim it.' },
    { q: 'What is a locked bonus?', a: 'A locked bonus is a reward that has been earned but still has wagering or time conditions to meet. It becomes claimable once those conditions are completed.' }
  ],
  period: ['Yesterday', 'Today', 'This Week', 'Last Week', 'This Month', 'Last Month'], teamData: 'Team A Data:', allTeamData: 'All Team Data:', dash: 'Data Dashboard:',
  stats: ['Members', 'New Depositors', 'Depositors', 'Deposit Amount', 'Withdrawals', 'Referral Bonus', 'Deposit Bonus', 'Bet Amounts', 'Commission'],
  dashCards: [
    { h: 'My Team Members', cols: ['All Team', 'Team A', 'Other Team'], vals: ['0', '0', '0'] },
    { h: 'Bonus', cols: ['All Bonus', 'Referral Bonus', 'Deposit Bonus'], vals: ['MYR 0.00', 'MYR 0.00', 'MYR 0.00'] },
    { h: 'Bet Amounts', cols: ['All Team', 'Team A', 'Other Team'], vals: ['MYR 0.00', 'MYR 0.00', 'MYR 0.00'] },
    { h: 'Bet Commission', cols: ['All Team', 'Team A', 'Other Team'], vals: ['MYR 0.00', 'MYR 0.00', 'MYR 0.00'] }
  ],
  searchPh: 'input userid to search', noData: 'Oops! There is no data yet!', details: 'Details'
}

const ZH: ReferText = {
  inviteTop: '邀请好友赚钱', inviteNow: '立即邀请', teamTitle: '推荐团队', teamSub: '推荐网络越大，奖励越多。',
  agentLevel: '代理等级：', you: '我', teamRule: 'A、B、C、D 团队按游戏类型返佣。',
  slotRule: '老虎机（每万）=（35、10、3、1）', fishRule: '捕鱼（每万）=（35、10、3、1）',
  totalComm: '总佣金：17.5+52.5+10+15+0.6+0.05=', totalExp: '总代理经验：5,000+15,000+10,000+50,000+ 2,000+500+113,000=',
  betSlot: (n) => `投注额（仅老虎机）：${n}`, betFish: (n) => `投注额（仅捕鱼）：${n}`, betAll: (n) => `投注额（全部）：${n}`,
  commGen: '产生佣金：', expEarned: '获得代理经验：',
  infNote: ['从 E 团队到无限团队，', '每投注 $1 获得 1 点代理经验。', '投注额：100,000', '为你贡献的代理经验总计：'],
  infRight: ['来自 E 团队至', '无限团队的代理经验', '10,000+100,000+3,000', '=113,000'],
  bullets: [
    [['你直接邀请的好友组成 ', false], ['A 团队', true], ['。', false]],
    [['当 ', false], ['A 团队', true], [' 成员邀请自己的好友，这些好友组成你的 ', false], ['B 团队', true], ['。', false], ['B 团队', true], ['与无限团队的构成规则相同。', false]],
    [['从你的推荐团队（', false], ['A–D 团队', true], ['）获得佣金，他们投注越多，你赚得越多。', false]],
    [['此外，你的代理等级根据整个团队（', false], ['A 团队至无限团队', true], ['）的表现升级，等级越高，返佣越多。', false]],
    [['佣金按有效的推荐投注计算。', false]]
  ],
  depTitle: '存款奖金', depSub: '好友每次存款你都能获得一定比例的奖励，代理等级越高，比例越高。',
  depLevel: '代理等级', depRatio: '奖金比例', depNote: '单笔存款至少 ',
  comTitle: '投注佣金', comSub: '扩大你的推荐网络，解锁更高的返佣比例。代理等级越高，可获得的推荐奖励越多。',
  comRate: '推荐佣金比例', comLevel: '代理等级',
  comCats: ['老虎机', '真人娱乐', '体育', '捕鱼', '迷你游戏', '桌面游戏', '彩票', '宾果', '斗鸡'],
  comNote: '推荐网络中所有有效投注都会计入代理等级进度，代理等级越高，推荐佣金比例越高。',
  faqTitle: '常见问题',
  faq: [
    { q: '推荐系统是怎么运作的', a: '把你的推荐链接分享给亲朋好友。凡是通过你的链接在 XXX 注册的用户，都会成为你推荐网络的一员。随着网络扩大并产生有效投注，你就能获得推荐奖金和佣金。' },
    { q: '什么是我的推荐团队？', a: '你直接邀请的好友组成 A 团队，他们邀请的好友组成 B 团队，依此类推到 D 团队，之后的全部成员为无限团队。每一层都会为你贡献佣金和代理经验。' },
    { q: '奖励由哪几部分组成？', a: '奖励来自三部分：每位有效好友的一次性推荐奖金、好友存款的一定比例，以及好友有效投注的佣金。' },
    { q: '为什么我邀请的好友（直属下线）没有成为有效用户？', a: '好友需要通过你的链接注册并完成要求的存款才算有效用户。请确认他们使用了你的链接，并满足最低单笔存款。' },
    { q: '我有很多粉丝，怎样获得专属优惠？', a: '请带上你的渠道信息联系客服，我们的团队会评估你的受众并商讨专属合作方案。' },
    { q: '怎样提升我的代理等级？', a: '代理等级随整个推荐网络的有效投注总额上升。达到下一级所需经验后会自动升级。' },
    { q: '为什么可领取的金额一直在变？', a: '好友投注和存款时，佣金与奖金会持续结算，因此在领取之前，可领取金额会实时变化。' },
    { q: '什么是锁定奖金？', a: '锁定奖金是已经获得、但仍需满足流水或时间条件的奖励，完成条件后即可领取。' }
  ],
  period: ['昨天', '今天', '本周', '上周', '本月', '上月'], teamData: 'A 团队数据：', allTeamData: '全部团队数据：', dash: '数据看板：',
  stats: ['成员', '新增存款人数', '存款人数', '存款金额', '提款', '推荐奖金', '存款奖金', '投注额', '佣金'],
  dashCards: [
    { h: '我的团队成员', cols: ['全部团队', 'A 团队', '其他团队'], vals: ['0', '0', '0'] },
    { h: '奖金', cols: ['全部奖金', '推荐奖金', '存款奖金'], vals: ['MYR 0.00', 'MYR 0.00', 'MYR 0.00'] },
    { h: '投注额', cols: ['全部团队', 'A 团队', '其他团队'], vals: ['MYR 0.00', 'MYR 0.00', 'MYR 0.00'] },
    { h: '投注佣金', cols: ['全部团队', 'A 团队', '其他团队'], vals: ['MYR 0.00', 'MYR 0.00', 'MYR 0.00'] }
  ],
  searchPh: '输入用户 ID 搜索', noData: '哎呀！暂时没有数据！', details: '详情'
}

export const referText = (lang: string): ReferText => (lang === 'zh' ? ZH : EN)
