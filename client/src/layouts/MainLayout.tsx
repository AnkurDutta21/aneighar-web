import React, { type ReactNode } from 'react'
import Navbar from '@/components/Navbar'

interface MainLayoutProps {
  children: ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => (
  <div className="min-h-screen bg-bg relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-subtle pointer-events-none" />
    <div className="relative z-10 flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>
    </div>
  </div>
)

export default MainLayout
