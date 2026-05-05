import React, { type ReactNode } from 'react'
import Navbar from '@/components/Navbar'

interface MainLayoutProps {
  children: ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => (
  <div className="app-bg min-h-screen">
    <Navbar />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {children}
    </main>
  </div>
)

export default MainLayout
