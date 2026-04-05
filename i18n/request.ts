import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value || 'en'
  const validLocales = ['en', 'fr', 'es']
  const safeLocale = validLocales.includes(locale) ? locale : 'en'

  return {
    locale: safeLocale,
    timeZone: 'UTC',
    messages: (await import(`../messages/${safeLocale}.json`)).default,
  }
})
