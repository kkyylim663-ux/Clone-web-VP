'use client'
// styled-jsx 样式注册器（Next 官方写法）：把组件样式写进服务端 HTML，刷新时不再先出现无样式画面
import { useState, type ReactNode } from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import { StyleRegistry, createStyleRegistry } from 'styled-jsx'

export default function StyledJsxRegistry({ children }: { children: ReactNode }) {
  const [registry] = useState(() => createStyleRegistry())
  useServerInsertedHTML(() => {
    const styles = registry.styles()
    registry.flush()
    return <>{styles}</>
  })
  return <StyleRegistry registry={registry}>{children}</StyleRegistry>
}
