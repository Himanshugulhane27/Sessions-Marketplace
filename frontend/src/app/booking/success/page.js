'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

export default function BookingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('confirming'); // confirming, success, error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setStatus('error');
      setErrorMsg('No session ID provided.');
      return;
    }

    api.get(`/bookings/confirm/?session_id=${sessionId}`)
      .then(() => {
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err.message || 'Failed to confirm booking.');
      });
  }, [searchParams]);

  return (
    <div className="page-container fade-in" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
      {status === 'confirming' && (
        <div className="empty-state">
          <div className="spinner" style={{ marginBottom: '1rem' }}></div>
          <h3>Confirming your booking...</h3>
          <p>Please wait while we verify your payment with Stripe.</p>
        </div>
      )}
      
      {status === 'success' && (
        <div className="empty-state">
          <div className="empty-state-icon">🎉</div>
          <h3>Booking Confirmed!</h3>
          <p>Your payment was successful and your spot is secured.</p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
            <Link href="/" className="btn btn-secondary">
              Browse More
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="empty-state">
          <div className="empty-state-icon">❌</div>
          <h3>Confirmation Failed</h3>
          <p className="error-message">{errorMsg}</p>
          <div style={{ marginTop: '2rem' }}>
            <Link href="/" className="btn btn-primary">
              Return Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
