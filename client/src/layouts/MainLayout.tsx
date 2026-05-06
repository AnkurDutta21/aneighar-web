import React from 'react'
import Navbar from '@/components/Navbar'

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-bg relative overflow-hidden">
    {/* Ambient background orbs */}
    <div className="orb orb-blue w-[700px] h-[700px] -top-48 -left-48 opacity-40 animate-orb" />
    <div className="orb orb-indigo w-[500px] h-[500px] top-1/2 -right-64 opacity-30 animate-orb delay-400" />
    <div className="orb orb-cyan w-[400px] h-[400px] bottom-0 left-1/3 opacity-20 animate-orb delay-200" />

    {/* Subtle grid overlay */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />

    <div className="relative z-10 flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>

      <footer className="relative z-10 border-t border-white/5 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-text-muted">
          © {new Date().getFullYear()} Anei Ghar · Made with ❤️ for students across India
        </div>
      </footer>
    </div>
  </div>
)

export default MainLayout
