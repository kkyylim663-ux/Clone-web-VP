'use client'
import LegalPage from '@/components/auth/LegalPage'
import { useLanguage } from '@/context/LanguageContext'

// 服务条款（bare 外壳）：手机整页长文；网页版：首页占位 + 模糊遮罩 + 居中弹窗（373×560，正文裁切）。
export default function TermsPage() {
  const { t } = useLanguage()
  return <LegalPage title={t('auth.legal.terms')} sections={30} />
}
