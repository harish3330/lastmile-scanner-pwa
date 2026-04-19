import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import '../styles/globals.css'
import Layout from '../components/Layout'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Set default theme to dark
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
