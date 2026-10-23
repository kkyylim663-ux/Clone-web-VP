// 切页进度条的事件中心：startNav() 由跳转处调用，NavProgress 监听；路径变化时 NavProgress 自己收尾
type Fn = () => void
const subs = new Set<Fn>()
export const onNavStart = (f: Fn) => { subs.add(f); return () => { subs.delete(f) } }
export const startNav = () => subs.forEach((f) => f())

type R = { push: (h: string) => void, replace: (h: string) => void }
/** router.push / replace 的带进度条版本 */
export const navPush = (r: R, href: string) => { startNav(); r.push(href) }
export const navReplace = (r: R, href: string) => { startNav(); r.replace(href) }
