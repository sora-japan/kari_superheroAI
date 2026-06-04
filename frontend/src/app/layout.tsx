import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'かり - 安心して話せる相談室',
  description: 'あなたの話を聴かせてください。',
  robots: { index: false, follow: false },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="h-full">
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="h-full">{children}</body>
    </html>
  )
}
