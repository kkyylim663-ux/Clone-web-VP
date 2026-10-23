'use client'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import PageTopBar from '@/components/auth/PageTopBar'
import SkImg from '@/components/ui/SkImg'

// 站点地图（bare 外壳）：手机整页分组列表（9 组）；网页版：标题 + 两列卡片。
// 去向（来源：实测 clicks-public.md /site-map；参考站 href 扫描 docs/nav-map/hrefs.md）：
//   参考站 href=/home 不是真实路由，实际回首页，故接到 `/`。第 10 张卡「其他站点链接」接 `/`。
// 文案：分组名与链接名为自写文案（auth.sitemap.*），不放原站文案。
const GROUPS: { g: string, links: { k: string, to: string }[] }[] = [
  { g: 'auth.sitemap.g1', links: [{ k: 'auth.sitemap.l1a', to: '/' }, { k: 'auth.sitemap.l1b', to: '/user' }] },
  { g: 'auth.sitemap.g2', links: [{ k: 'auth.sitemap.l2a', to: '/casino' }, { k: 'auth.sitemap.l2b', to: '/' }] },
  { g: 'auth.sitemap.g3', links: [{ k: 'auth.sitemap.l3a', to: '/sports' }] },
  { g: 'auth.sitemap.g4', links: [{ k: 'auth.sitemap.l4a', to: '/bonus' }] },
  { g: 'auth.sitemap.g5', links: [{ k: 'auth.sitemap.l5a', to: '/user' }] },
  { g: 'auth.sitemap.g6', links: [{ k: 'auth.sitemap.l6a', to: '/refer-earn' }] },
  { g: 'auth.sitemap.g7', links: [{ k: 'auth.sitemap.l7a', to: '/vip' }] },
  { g: 'auth.sitemap.g8', links: [{ k: 'auth.sitemap.l8a', to: '/' }] },
  { g: 'auth.sitemap.g9', links: [{ k: 'auth.sitemap.l9a', to: '/casino' }] }
]

// 参考站 12 个内链：手机多一个「下载 App」（href 扫描 → /home，实际回首页，接 `/`），桌面放在「其他站点链接」卡里
const MOBILE_GROUPS = [...GROUPS, { g: 'auth.sitemap.other', links: [{ k: 'auth.sitemap.l10a', to: '/' }] }]

export default function SiteMapPage() {
  const { t } = useLanguage()
  return (
    <div className="sm">
      <div className="m">
        <PageTopBar kind="back" title={t('auth.sitemap.title')} />
        {MOBILE_GROUPS.map((grp, gi) => (
          <div key={grp.g} className={`grp${gi === 0 ? ' first' : ''}`}>
            <div className="gt">{t(grp.g)}</div>
            <div className={`links${gi === 1 ? ' two' : ''}`}>
              {grp.links.map((l) => <Link key={l.k} className="site_map_pg__lk" href={l.to}>{t(l.k)}</Link>)}
            </div>
          </div>
        ))}
        {/* 外站链接区占位（参考站 375 底部三个外站徽标，位置按实测；不放原站图片） */}
        <SkImg style={{ position: 'absolute', left: 103, top: 1368 }} w={162} h={60} label="外站徽标 1" />
        <SkImg style={{ position: 'absolute', left: 145, top: 1444 }} w={96} h={48} label="外站徽标 2" />
        <SkImg style={{ position: 'absolute', left: 'min(253px, calc(100% - 93px))', top: 1444 }} w={85} h={48} label="外站徽标 3" />
      </div>

      <div className="d">
        <h1 className="ttl">{t('auth.sitemap.title')}</h1>
        <div className="grid">
          {GROUPS.map((grp, i) => (
            <div key={grp.g} className={`card${i < 2 ? ' big' : ''}`}>
              <div className="ct">{t(grp.g)}</div>
              {i === 1 ? (
                <div className="row">
                  <Link className="site_map_pg__cl" href={grp.links[0]!.to}>{t(grp.links[0]!.k)}</Link>
                  <span className="sep">|</span>
                  <Link className="site_map_pg__cl" href={grp.links[1]!.to}>{t(grp.links[1]!.k)}</Link>
                </div>
              ) : (
                grp.links.map((l) => <Link key={l.k} className="site_map_pg__cl" href={l.to}>{t(l.k)}</Link>)
              )}
            </div>
          ))}
          <div className="card">
            <div className="ct">{t('auth.sitemap.other')}</div>
            <Link className="site_map_pg__cl" href="/">{t('auth.sitemap.l10a')}</Link>
          </div>
        </div>
        <div className="more">
          <div className="wide" />
          <div className="pair"><div className="half" /><div className="half" /></div>
        </div>
      </div>

      <style jsx>{`
        .sm { font-size: 14px; }
        .m { position: relative; min-height: 812px; box-sizing: border-box; padding: 0; background: #1a1a21; }
        .grp { margin: 0 16px 26px; }
        .grp.first { margin-top: 69px; }
        .gt { height: 20px; color: #fff; font-size: 16px; font-weight: 700; line-height: 20px; }
        .links { display: flex; flex-direction: column; margin-top: 7px; }
        .links.two { flex-direction: row; flex-wrap: wrap; }
        :global(.site_map_pg__lk) { height: 22px; line-height: 22px; color: #8d9099; font-size: 14px; text-decoration: none; }
        .links.two :global(.site_map_pg__lk) { width: 206px; }
        .d { display: none; min-height: 740px; padding-top: 3px; box-sizing: border-box; }
        .ttl { height: 28px; margin: 0 0 25px; color: #fff; font-size: 22px; font-weight: 700; line-height: 28px; }
        .grid { display: grid; grid-template-columns: 476px 476px; gap: 16px; }
        .card { box-sizing: border-box; height: 96px; padding: 20px 24px; display: flex; flex-direction: column; justify-content: center; border-radius: 16px; background: rgba(255, 255, 255, 0.05); }
        .card.big { height: 114px; }
        .ct { height: 20px; margin-bottom: 18px; color: #fff; font-size: 16px; font-weight: 700; line-height: 20px; }
        :global(.site_map_pg__cl) { color: #8d9099; font-size: 14px; line-height: 17px; text-decoration: none; }
        .row { display: flex; align-items: center; gap: 12px; }
        .sep { color: #4a4e57; }
        .more { margin-top: 128px; }
        .wide, .half { height: 88px; border-radius: 16px; background: rgba(255, 255, 255, 0.05); }
        .pair { display: grid; grid-template-columns: 476px 476px; gap: 16px; margin-top: 16px; }
        @media (min-width: 768px) {
          .m { display: none; }
          .d { display: block; }
        }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
