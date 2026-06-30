'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

function CreateSessionModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '0',
    datetime: '',
    capacity: '10',
    image_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await api.post('/sessions/', {
        ...form,
        price: parseFloat(form.price) || 0,
        capacity: parseInt(form.capacity) || 10,
        datetime: new Date(form.datetime).toISOString(),
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fade-in" onClick={(e) => e.stopPropagation()}>
        <h2>Create Session</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              name="title"
              className="form-control"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              className="form-control"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Price ($)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={form.price}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Capacity</label>
              <input
                name="capacity"
                type="number"
                min="1"
                className="form-control"
                value={form.capacity}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Date & Time</label>
            <input
              name="datetime"
              type="datetime-local"
              className="form-control"
              value={form.datetime}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Image URL (optional)</label>
            <input
              name="image_url"
              type="url"
              className="form-control"
              value={form.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditSessionModal({ session, onClose, onUpdated }) {
  const [form, setForm] = useState({
    title: session.title,
    description: session.description,
    price: String(session.price),
    datetime: new Date(session.datetime).toISOString().slice(0, 16),
    capacity: String(session.capacity),
    image_url: session.image_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await api.patch(`/sessions/${session.id}/`, {
        ...form,
        price: parseFloat(form.price) || 0,
        capacity: parseInt(form.capacity) || 10,
        datetime: new Date(form.datetime).toISOString(),
      });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fade-in" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Session</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input name="title" className="form-control" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" className="form-control" value={form.description} onChange={handleChange} rows={3} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Price ($)</label>
              <input name="price" type="number" step="0.01" min="0" className="form-control" value={form.price} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Capacity</label>
              <input name="capacity" type="number" min="1" className="form-control" value={form.capacity} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Date & Time</label>
            <input name="datetime" type="datetime-local" className="form-control" value={form.datetime} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input name="image_url" type="url" className="form-control" value={form.image_url} onChange={handleChange} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreatorPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editSession, setEditSession] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/');
      } else if (user.role !== 'creator') {
        router.push('/dashboard');
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'creator') loadSessions();
  }, [user]);

  async function loadSessions() {
    try {
      setLoading(true);
      const data = await api.get('/creator/sessions/');
      setSessions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(sessionId) {
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
      await api.delete(`/sessions/${sessionId}/`);
      loadSessions();
    } catch (err) {
      setError(err.message);
    }
  }

  if (authLoading || !user || user.role !== 'creator') {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading...
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Creator Studio</h1>
          <p>Manage your sessions and track bookings</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Create Session
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <h3>No sessions yet</h3>
          <p>Create your first session to start earning!</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowCreate(true)}>
            + Create Session
          </button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="creator-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Price</th>
                <th>Bookings</th>
                <th>Capacity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const date = new Date(session.datetime);
                return (
                  <tr key={session.id}>
                    <td style={{ fontWeight: 600 }}>{session.title}</td>
                    <td>{date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</td>
                    <td style={{ color: 'var(--success)' }}>
                      {parseFloat(session.price) === 0 ? 'Free' : `$${parseFloat(session.price).toFixed(2)}`}
                    </td>
                    <td>
                      <span style={{
                        background: 'var(--accent-glow)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 6,
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                      }}>
                        {session.booking_count || 0}
                      </span>
                    </td>
                    <td>{session.capacity}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditSession(session)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(session.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateSessionModal
          onClose={() => setShowCreate(false)}
          onCreated={loadSessions}
        />
      )}

      {editSession && (
        <EditSessionModal
          session={editSession}
          onClose={() => setEditSession(null)}
          onUpdated={loadSessions}
        />
      )}
    </div>
  );
}
