import './globals.css'
import Providers from '../components/providers/Providers'

export const metadata = {
  title: 'Nobles Performance OS',
  description: 'Premium staff performance management for Nobles Cooperative Limited',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F8F5EF] text-[#232323]">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
