'use client';

import './globals.css';
import { AuthProvider, useAuth } from '@/lib/auth';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Link from 'next/link';

function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">⚡ Sessions</Link>
      <div className="navbar-links">
        {loading ? null : user ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            {user.role === 'creator' && <Link href="/creator">Creator Studio</Link>}
            <div className="navbar-user">
              {user.avatar_url && (
                <img src={user.avatar_url} alt="" className="navbar-avatar" />
              )}
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {user.name || user.email}
              </span>
              <button onClick={logout} className="btn btn-secondary btn-sm">
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <Link href="/" style={{ color: 'var(--accent-secondary)' }}>Sign In →</Link>
        )}
      </div>
    </nav>
  );
}

export default function RootLayout({ children }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <html lang="en">
      <head>
        <title>Sessions Marketplace</title>
        <meta name="description" content="Discover and book amazing sessions from top creators" />
      </head>
      <body>
        <GoogleOAuthProvider clientId={clientId}>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
