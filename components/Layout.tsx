import React, { ReactNode } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="dash-body">
        <Sidebar />
        <main className="main-area">{children}</main>
      </div>
    </div>
  )
}
