'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

function BookingsList({ bookings, onCancel }) {
  if (bookings.length === 0) {
    return (
      <div className="empty-state fade-in" style={{ marginTop: '2rem' }}>
        <div className="empty-state-icon">📅</div>
        <h3>No bookings yet</h3>
        <p>Browse sessions and book your first one to get started!</p>
      </div>
    );
  }

  return (
    <div>
      {bookings.map((booking) => {
        const date = new Date(booking.session_info?.datetime);
        return (
          <div key={booking.id} className="booking-item fade-in">
            <div className="booking-item-image" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--bg-card-hover), var(--accent-glow))', fontSize: '1.5rem',
            }}>
              🎯
            </div>
            <div className="booking-item-info">
              <h3>{booking.session_info?.title || 'Session'}</h3>
              <p>
                {date.toLocaleDateString()} • {date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              <span className={`badge badge-${booking.status}`}>{booking.status}</span>
              {booking.payment_status && (
                <span className={`badge ${booking.payment_status === 'paid' ? 'badge-completed' : 'badge-cancelled'}`}>
                  {booking.payment_status === 'paid' ? 'Paid' : booking.payment_status}
                </span>
              )}
            </div>
            {booking.status === 'active' && onCancel && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onCancel(booking.id)}
              >
                Cancel
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProfileTab() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await api.patch('/profile/', { name, avatar_url: avatarUrl });
      setSuccess('Profile updated!');
      refreshUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleBecomeCreator() {
    try {
      setError('');
      await api.post('/auth/become-creator/', {});
      setSuccess('You are now a creator! Refresh to see Creator Studio.');
      refreshUser();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 500 }}>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Avatar URL</label>
          <input
            type="url"
            className="form-control"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
          />
        </div>
        <div className="form-group">
          <label>Role</label>
          <div style={{
            padding: '0.75rem 1rem',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            color: 'var(--text-secondary)',
          }}>
            {user?.role === 'creator' ? '✨ Creator' : '👤 User'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {user?.role !== 'creator' && (
            <button type="button" className="btn btn-secondary" onClick={handleBecomeCreator}>
              ✨ Become a Creator
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('active');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) loadBookings();
  }, [user, tab]);

  async function loadBookings() {
    try {
      setLoading(true);
      const statusParam = tab === 'profile' ? 'active' : tab;
      const data = await api.get(`/bookings/list/?status=${statusParam}`);
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(bookingId) {
    try {
      await api.post(`/bookings/${bookingId}/cancel/`, {});
      loadBookings();
    } catch (err) {
      setError(err.message);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading...
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p style={{ fontSize: '1.125rem' }}>Manage your bookings and profile</p>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>
          Active Bookings
        </button>
        <button className={`tab ${tab === 'past' ? 'active' : ''}`} onClick={() => setTab('past')}>
          Past Bookings
        </button>
        <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
          Profile
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {tab === 'profile' ? (
        <ProfileTab />
      ) : loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading bookings...
        </div>
      ) : (
        <BookingsList bookings={bookings} onCancel={tab === 'active' ? handleCancel : null} />
      )}
    </div>
  );
}
