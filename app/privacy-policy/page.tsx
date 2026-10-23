'use client'
import LegalPage from '@/components/auth/LegalPage'
import { PRIVACY } from '@/lib/legal/privacy'
import { useLanguage } from '@/context/LanguageContext'

// 隐私政策（bare 外壳）：正文取自参考站 17 章，品牌词/公司信息为 XXX 占位。
export default function PrivacyPage() {
  const { t } = useLanguage()
  return <LegalPage title={t('auth.legal.privacy')} sections={PRIVACY.length} content={PRIVACY} />
}
