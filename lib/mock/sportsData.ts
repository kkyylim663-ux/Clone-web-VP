// 体育首页示例赛事（队名 / 联赛 / 赔率对照参考站截图；第三方体育平台接入后由接口替换）。
export interface Team { name: string, abbr: string, c1: string, c2: string, shirt?: string }
export interface Match { id: number, sport: string, country: string, league: string, when: string, home: Team, away: Team, market: string, odds: { k: string, v: string }[] }

const T = (name: string, abbr: string, c1: string, c2: string, shirt?: string): Team => ({ name, abbr, c1, c2, shirt })
export const TEAMS = {
  ars: T('Arsenal FC', 'ARS', '#e11d2e', '#ffffff', '#d4202c'),
  mci: T('Manchester City', 'MCI', '#6cabdd', '#ffffff', '#58b2ee'),
  phi: T('Philadelphia 76ers', '76', '#1e5bb8', '#e11d2e'),
  cle: T('Cleveland Cavaliers', 'CLE', '#6f263d', '#fdb927'),
  okc: T('Oklahoma City Thunder', 'OKC', '#007ac1', '#ef3b24'),
  den: T('Denver Nuggets', 'DEN', '#0e2240', '#fec524'),
  mta: T('Maccabi Tel-Aviv', 'MTA', '#ffc20e', '#0057b8'),
  rma: T('Real Madrid', 'RMA', '#ffffff', '#febe10')
}

const wl = (a: string, b: string) => [{ k: '1', v: a }, { k: '2', v: b }]
const x12 = (a: string, d: string, b: string) => [{ k: '1', v: a }, { k: 'draw', v: d }, { k: '2', v: b }]

export const FEATURED: (Match & { tone: 'blue' | 'pink' | 'purple' })[] = [
  { id: 1, tone: 'blue', sport: 'soccer', country: 'England', league: 'FA Cup (2x6 min)', when: 'Today, 23:58', home: TEAMS.ars, away: TEAMS.mci, market: '1x2', odds: x12('-0.37', '-0.455', '0.90') },
  { id: 2, tone: 'pink', sport: 'basketball', country: 'USA', league: 'NBA', when: 'Tomorrow, 07:00', home: TEAMS.phi, away: TEAMS.cle, market: 'Winner (incl. overtime)', odds: wl('0.69', '-0.847') },
  { id: 3, tone: 'pink', sport: 'basketball', country: 'USA', league: 'NBA', when: 'Tomorrow, 09:30', home: TEAMS.okc, away: TEAMS.den, market: 'Winner (incl. overtime)', odds: wl('0.29', '-0.385') },
  { id: 4, tone: 'purple', sport: 'soccer', country: 'England', league: 'FA Cup (2x6 min)', when: 'Today, 23:58', home: TEAMS.mci, away: TEAMS.ars, market: '1x2', odds: x12('-0.196', '-0.455', '0.62') }
]

export const MATCHES: Match[] = [
  { id: 11, sport: 'basketball', country: 'USA', league: 'NBA', when: 'Tomorrow, 09:30', home: TEAMS.okc, away: TEAMS.den, market: 'Winner (incl. overtime)', odds: wl('0.29', '-0.385') },
  { id: 12, sport: 'basketball', country: 'USA', league: 'NBA', when: 'Tomorrow, 07:00', home: TEAMS.phi, away: TEAMS.cle, market: 'Winner (incl. overtime)', odds: wl('0.69', '-0.847') },
  { id: 13, sport: 'basketball', country: 'International', league: 'Euroleague', when: 'Tomorrow, 02:05', home: TEAMS.mta, away: TEAMS.rma, market: 'Winner (incl. overtime)', odds: wl('-0.602', '0.48') }
]
