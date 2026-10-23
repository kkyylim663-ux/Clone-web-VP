'use client'
// 赌场 / 首页轮播（Swiper React）。参数同 Vue 版（docs/motion-spec/css-and-swiper.md §5.1–5.2）：
// autoplay 10000ms、waitForTransition、不因交互停止；loop；speed 300；圆点可点。
// 点击用容器事件委托读 data-to（loop 复制的节点没有 React 事件，但带 data 属性）。
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import SkImg from '@/components/ui/SkImg'
import { useLanguage } from '@/context/LanguageContext'

export interface SlideItem { title?: string, to?: string }
interface Props { variant: 'desk' | 'mob', slides: SlideItem[], onSlide: (to: string) => void, cta?: string }

export default function SkSlider({ variant, slides, onSlide, cta }: Props) {
  const { t } = useLanguage()
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const to = (e.target as HTMLElement).closest<HTMLElement>('[data-to]')?.dataset.to
    if (to) onSlide(to)
  }
  return (
    <div className="sk-wrap" onClick={onClick}>
      <Swiper
        className={`browse_skslider__sk-slider ${variant}`}
        modules={[Autoplay, Pagination]}
        loop={slides.length > 2}
        speed={300}
        slidesPerView={1}
        spaceBetween={0}
        autoplay={{ delay: 10000, waitForTransition: true, disableOnInteraction: false, pauseOnMouseEnter: false }}
        pagination={{ clickable: true, dynamicBullets: false, hideOnClick: false }}
      >
        {slides.map((s, i) => (
          <SwiperSlide key={i}>
            <div className="slide" data-to={s.to}>
              {variant === 'desk' ? (
                <>
                  <SkImg src={`/assets/casino/slide-m-${i % 5 + 1}.webp`} className="browse_skslider__dimg" w="100%" h="100%" radius={0} label="" />
                  <span className="d-title">{s.title}</span>
                  <span className="cta-s">{t('browse.register')}</span>
                </>
              ) : (
                <>
                  <SkImg src={`/assets/casino/slide-m-${i % 5 + 1}.webp`} w="100%" h={211} radius={0} label="" className="browse_skslider__mimg" />
                  <span className="mob-title">{s.title}</span>
                  {cta ? <span className="mob-cta">{cta}<svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true"><path d="M5 2.500l4.500 4.500L5 11.500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span> : null}
                </>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <style jsx>{`
        :global(.browse_skslider__sk-slider) { position: relative; overflow: hidden; background: #0b0b0c; }
        /* 网页：填满 614×234 轮播框（外框 1px 内缩，与原骨架一致） */
        :global(.browse_skslider__sk-slider).desk { border-radius: 24px; position: absolute; left: 1px; right: 1px; top: 1px; height: calc(100% - 2px); }
        /* 手机：全宽 375×211 */
        :global(.browse_skslider__sk-slider).mob { height: 233px; border-radius: 14px; background: transparent; }
        /* 手机：圆点在图片下方（不压在图上），当前点为长条；图片下半部渐隐，避免刺眼 */
        :global(.browse_skslider__sk-slider).mob .slide { height: 211px; background: transparent; }
        :global(.browse_skslider__sk-slider).mob :global(.swiper-pagination) { top: auto; bottom: 4px; left: 0; right: 0; width: 100%; height: 14px; display: flex; align-items: center; justify-content: center; gap: 6px; }
        :global(.browse_skslider__sk-slider).mob :global(.swiper-pagination-bullet-active) { width: 20px; border-radius: 3px; }
        :global(.browse_skslider__mimg) { border-radius: 14px; overflow: hidden; }
        :global(.browse_skslider__mimg) img, :global(.browse_skslider__mimg) video { opacity: .85; -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 45%, rgba(0, 0, 0, .55) 75%, transparent 100%); mask-image: linear-gradient(to bottom, #000 0%, #000 45%, rgba(0, 0, 0, .55) 75%, transparent 100%); }
        :global(.browse_skslider__mimg) img, :global(.browse_skslider__mimg) video { object-position: right center; }
        .mob-cta { position: absolute; left: 20px; top: 128px; height: 38px; padding: 0 18px 0 22px; border-radius: 28px; background: rgba(255, 255, 255, 0.18); backdrop-filter: blur(4px); display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; letter-spacing: 1px; color: #fff; text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6); }
        .slide { position: relative; height: 100%; background: #0b0b0c; }
        /* 手机横幅标题：左 16、标题中心约 y 105（相对横幅顶部） */
        .mob-title { position: absolute; left: 20px; top: 34px; font-size: 30px; font-weight: 800; line-height: 36px; letter-spacing: 1px; color: #fff; white-space: nowrap; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7); }
        :global(.browse_skslider__dimg) { position: absolute; inset: 0; }
        :global(.browse_skslider__dimg) img, :global(.browse_skslider__dimg) video { object-position: right center; }
        .slide .d-title { position: absolute; left: 40px; top: 50%; transform: translateY(-80%); max-width: 50%; z-index: 1; font-size: 44px; font-weight: 800; line-height: 1.2; letter-spacing: .5px; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,.55), 0 4px 22px rgba(0,0,0,.7); }
        .slide:has(.d-title)::before { content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none; background: linear-gradient(90deg, rgba(4, 12, 14, .72) 0%, rgba(4, 12, 14, .4) 40%, transparent 70%); }
        .slide .cta-s { position: absolute; left: 40px; bottom: 32px; z-index: 1; height: 50px; padding: 0 36px; border-radius: 14px; background: #fff; color: #111; display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 800; white-space: nowrap; box-shadow: 0 6px 18px rgba(0,0,0,.4); transition: transform .15s ease, filter .2s ease; }
        .slide .cta-s:hover { filter: brightness(.94); transform: translateY(-1px); }
        /* 网页圆点：右下角 80×44 区域，6px 圆点，间距 6（原骨架数值） */
        :global(.browse_skslider__sk-slider).desk :global(.swiper-pagination) { top: auto; bottom: 18px; left: auto; right: 18px; width: 80px; height: 44px; display: flex; align-items: center; justify-content: center; gap: 6px; }
        :global(.browse_skslider__sk-slider) :global(.swiper-pagination-bullet) { width: 6px; height: 6px; margin: 0; opacity: 1; background: rgba(255, 255, 255, 0.35); cursor: pointer; }
        :global(.browse_skslider__sk-slider) :global(.swiper-pagination-bullet-active) { background: #fff; }
        .sk-wrap { position: relative; height: 100%; }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
