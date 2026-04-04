import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DataPulse AI — Raw Data to Authority Content in 60 Seconds',
  description: 'Upload any PDF, report, or white paper. DataPulse AI extracts your strongest insights and generates a complete social media content pack for LinkedIn, X, Instagram and infographics — in English, French, and Spanish.',
  keywords: ['AI', 'content generation', 'PDF analysis', 'social media', 'B2B marketing', 'LinkedIn', 'thought leadership'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
