import React, { useState } from 'react'
import Link from 'next/link'
import { Zap, Sun, Moon } from 'lucide-react'

export default function Navbar() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme)
    }
  }

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        <Zap size={18} />
        <span>LastMile</span>
        <span style={{ fontSize: '12px', marginLeft: '4px', opacity: 0.7 }}>Scanner PWA</span>
      </Link>

      <div className="navbar-right">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? (
            <>
              <Sun size={13} /> Light
            </>
          ) : (
            <>
              <Moon size={13} /> Dark
            </>
          )}
        </button>
      </div>
    </nav>
  )
}
