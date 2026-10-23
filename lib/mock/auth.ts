// 认证页 mock 的共用规则（登录/注册接口在 app/api/web/auth/{login,register}；这里是忘记密码、账户验证）。
// 测试规则：任意账号 + 密码 ≥6 位即成功；密码 wrong123 登录失败（1001）；验证码统一为 MOCK_CODE。
export const MOCK_CODE = '123456'
export const PASSWORD_MIN = 6

/** 邮箱格式（前后端共用） */
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
/** 手机号：6–13 位数字（不含区号） */
export const isPhone = (v: string) => /^\d{6,13}$/.test(v)
/** 忘记密码 / 账户验证用的账号：手机或邮箱 */
export const isAccount = (v: unknown): v is string => typeof v === 'string' && (isEmail(v.trim()) || isPhone(v.trim()))
