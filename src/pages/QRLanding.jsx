import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/QRLanding.css';

export default function QRLanding() {
  const { qrId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const redirectToDestination = async () => {
      try {
        // Fetch QR code details from backend
        const response = await fetch(`/api/qr/details/${qrId}`);
        if (!response.ok) throw new Error('QR code not found');
        
        const data = await response.json();
        
        // Redirect immediately (milliseconds)
        window.location.href = data.destinationUrl;
      } catch (err) {
        console.error('Error fetching QR data:', err);
        setError('Invalid QR code');
      }
    };

    redirectToDestination();
  }, [qrId]);

  if (error) {
    return (
      <div className="qr-landing error-state">
        <div className="error-container">
          <h1>Invalid QR Code</h1>
          <p>{error}</p>
          <button onClick={() => navigate('/')}>Return Home</button>
        </div>
      </div>
    );
  }

  // Show loading state while redirecting
  return (
    <div className="qr-landing loading-state">
      <div className="loading-container">
        <div className="spinner"></div>
        <h2>Redirecting...</h2>
        <p>Processing your scan</p>
      </div>
    </div>
  );
}
