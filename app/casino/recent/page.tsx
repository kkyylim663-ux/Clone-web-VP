'use client'
// 最近玩（/casino/recent）：参考站没有此路径，沿用收藏页的「最近玩」标签（docs/skeleton-spec/recent.md）。
import FavRecent from '@/components/browse/FavRecent'

export default function Page() {
  return <FavRecent tab="recent" />
}
