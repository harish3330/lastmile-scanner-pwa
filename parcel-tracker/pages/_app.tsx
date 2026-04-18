import type { AppProps } from 'next/app';
import { AuthProvider } from '@/lib/context/AuthContext';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import Navbar from '@/components/Navbar';
import '../index.css';
import '../App.css';

/** Shared layout shell (Navbar + page content) */
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Navbar />
      {children}
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  // Simple layout logic for now - index.tsx/login.tsx can handle their own protected status
  // or use a reusable HOC in the pages themselves.
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}
