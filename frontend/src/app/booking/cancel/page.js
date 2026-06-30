'use client';

import Link from 'next/link';

export default function BookingCancelPage() {
  return (
    <div className="page-container fade-in" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3>Payment Cancelled</h3>
        <p>You have cancelled the checkout process. Your booking was not completed.</p>
        <div style={{ marginTop: '2rem' }}>
          <Link href="/" className="btn btn-primary">
            Return to Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
