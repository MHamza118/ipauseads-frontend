import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function QRLanding() {
  const { qrId } = useParams();

  useEffect(() => {
    const redirect = async () => {
      try {
        // Fetch QR code details from backend
        const response = await fetch(`/api/qr/details/${qrId}`);
        if (!response.ok) throw new Error('QR code not found');
        
        const data = await response.json();
        
        // Redirect immediately to destination (0ms delay)
        window.location.replace(data.destinationUrl);
      } catch (err) {
        console.error('Error fetching QR data:', err);
        // Fallback redirect
        window.location.replace('https://ipauseads.com');
      }
    };

    redirect();
  }, [qrId]);

  // Return null - page will redirect before rendering
  return null;
}
