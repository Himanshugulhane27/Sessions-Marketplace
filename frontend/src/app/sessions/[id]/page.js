'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSession();
  }, [params.id]);

  async function loadSession() {
    try {
      setLoading(true);
      const data = await api.get(`/sessions/${params.id}/`);
      setSession(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBook() {
    if (!user) {
      router.push('/');
      return;
    }

    try {
      setBooking(true);
      setError('');
      const data = await api.post('/bookings/checkout/', { session: session.id });
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('No checkout URL returned.');
        setBooking(false);
      }
    } catch (err) {
      setError(err.message);
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading session...
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!session) return null;

  const date = new Date(session.datetime);

  return (
    <div className="session-detail fade-in">
      <div>
        {session.image_url ? (
          <img src={session.image_url} alt={session.title} className="session-detail-image" />
        ) : (
          <div className="session-detail-image" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '5rem', background: 'linear-gradient(135deg, var(--bg-card-hover), var(--accent-glow))',
          }}>
            🎯
          </div>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <h1>{session.title}</h1>

          <div className="session-detail-meta">
            <div className="session-detail-meta-item">
              <span className="icon">📅</span>
              {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="session-detail-meta-item">
              <span className="icon">⏰</span>
              {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </div>
            <div className="session-detail-meta-item">
              <span className="icon">👤</span>
              Hosted by {session.creator_info?.name || 'Creator'}
            </div>
            <div className="session-detail-meta-item">
              <span className="icon">🎟️</span>
              {session.spots_left} of {session.capacity} spots remaining
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>About this session</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {session.description || 'No description provided.'}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="booking-card">
          <div className="booking-card-price">
            {parseFloat(session.price) === 0 ? <span style={{color: 'var(--accent-primary)'}}>Free</span> : `$${parseFloat(session.price).toFixed(2)}`}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            per person
          </p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {!user ? (
            <button className="btn btn-primary" onClick={() => router.push('/')}>
              Sign in to Book
            </button>
          ) : session.spots_left <= 0 ? (
            <button className="btn btn-secondary" disabled>Sold Out</button>
          ) : success ? (
            <button className="btn btn-secondary" onClick={() => router.push('/dashboard')}>
              View My Bookings
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleBook}
              disabled={booking}
            >
              {booking ? 'Booking...' : 'Book Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
