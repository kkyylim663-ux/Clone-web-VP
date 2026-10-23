// 站内图片素材（public/assets/*）。按种子稳定取图：同一个种子永远得到同一张。
const hash = (seed: string | number) => {
  const s = String(seed)
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
const pad = (n: number) => String(n).padStart(2, '0')
import { GAME_COVERS } from './mock/gameCovers'
import { GAME_GROUPS } from './mock/gameGroups'
const REAL = new Map<string, string>(GAME_COVERS.flatMap((g) => g.files.map((f, i): [string, string] => [`${g.folder}-${i + 1}`, `/assets/games/${g.folder}/${f}`]).concat(GAME_GROUPS.map((x): [string, string] => [`${x.group}-${x.n}`, `/assets/games/g/${x.group}-${x.n}.webp`]))))
export const coverV = (seed: string | number) => REAL.get(String(seed)) ?? ''
export const coverH = (seed: string | number) => REAL.get(String(seed)) ?? ''
export const avatarImg = (n: number | string) => {
  const k = Number(n)
  return `/assets/avatar/avatar-${pad((Number.isFinite(k) && k > 0 ? k - 1 : hash(n)) % 8 + 1)}.webp`
}
export const poolImg = (seed: string | number) => `/assets/jackpot/pool-${(hash(seed) % 3) + 1}.webp`
export const HOME = {
  heroDesktop: '/assets/home/hero-desktop.webp',
  heroMobile: '/assets/home/hero-mobile.webp',
  chest: '/assets/home/jackpot-chest.webp',
  gift: '/assets/home/bonus-gift.webp',
  mini: '/assets/home/mini-chest.webp',
}
export const EMPTY = ['/assets/empty/empty-1.webp', '/assets/empty/empty-2.webp', '/assets/empty/empty-3.webp']
