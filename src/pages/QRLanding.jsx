import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function QRLanding() {
  const { qrId } = useParams();

  useEffect(() => {
    // Redirect immediately without waiting for fetch
    const redirect = async () => {
      try {
        const response = await fetch(`/api/qr/details/${qrId}`, { 
          signal: AbortSignal.timeout(1000) // 1 second timeout max
        });
        if (response.ok) {
          const data = await response.json();
          window.location.replace(data.destinationUrl);
        } else {
          window.location.replace('https://ipauseads.com');
        }
      } catch (err) {
        window.location.replace('https://ipauseads.com');
      }
    };

    redirect();
  }, [qrId]);

  return null;
}
