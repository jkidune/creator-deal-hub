import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Creator Deal Hub',
  description: 'Brand deal management for creators',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
