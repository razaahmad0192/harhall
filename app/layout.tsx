import './globals.css'
import { Inter } from 'next/font/google'
import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'HarHall',
  description: 'Find handymen near you',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <div className="fixed bottom-3 right-4 text-xs text-gray-400 pointer-events-none select-none z-50">
            Developed by Ahmed Raza
          </div>
        </Providers>
      </body>
    </html>
  )
}