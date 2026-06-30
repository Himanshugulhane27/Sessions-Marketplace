'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { GoogleLogin } from '@react-oauth/google';
import api from '@/lib/api';
import Link from 'next/link';

function SessionCard({ session, isFeatured }) {
  const date = new Date(session.datetime);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <Link href={`/sessions/${session.id}`} style={{ textDecoration: 'none' }}>
      <div className={`card fade-in ${isFeatured ? 'featured-card' : ''}`}>
        {session.image_url ? (
          <img src={session.image_url} alt={session.title} className="card-image" />
        ) : (
          <div className="card-image" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
          }}>
            🎯
          </div>
        )}
        <div className="card-body">
          <h3 className="card-title">{session.title}</h3>
          <div className="card-meta">
            <span>📅 {formattedDate}</span>
            <span>⏰ {formattedTime}</span>
          </div>
          <div className="card-meta">
            <span>👤 {session.creator_info?.name || 'Creator'}</span>
            <span>🎟️ {session.spots_left} spots left</span>
          </div>
          <div className="card-price" style={{ marginTop: '0.5rem' }}>
            {parseFloat(session.price) === 0 ? (
              <span className="free">Free</span>
            ) : (
              `$${parseFloat(session.price).toFixed(2)}`
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { user, login, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      setLoading(true);
      const data = await api.get('/sessions/');
      setSessions(data.results || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSuccess = async (response) => {
    try {
      await login(response.credential);
    } catch (err) {
      setError('Login failed: ' + err.message);
    }
  };

  return (
    <>
      <div className="hero">
        <div className="hero-content">
          <h1>Master Your Craft with Expert Sessions</h1>
          <p>
            Book unique 1-on-1 learning experiences, workshops, and creative sessions
            from talented professionals around the world.
          </p>
          <div className="hero-actions">
            <a href="#sessions" className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
              Explore Sessions
            </a>
            {!authLoading && !user && (
              <div style={{ display: 'inline-block' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google login failed')}
                  theme="outline"
                  size="large"
                  shape="pill"
                  text="signin_with"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div id="sessions"></div>

      {error && (
        <div className="page-container">
          <div className="error-message">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✨</div>
          <h3>No sessions yet</h3>
          <p>Be the first creator to list a session!</p>
        </div>
      ) : (
        <div className="sessions-grid">
          {sessions.map((session, index) => (
            <SessionCard key={session.id} session={session} isFeatured={index === 0} />
          ))}
        </div>
      )}
    </>
  );
}
