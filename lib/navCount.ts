// 站内导航计数：Shell 在路由变化时 +1；useGate().back 据此判断「站内有没有上一页」。
// 为什么不用 history.length：直接打开页面时浏览器历史里可能有外站/空白页，back() 会跳出本站。
export const navCount = { value: 0 }
