// src/services/scansApi.js
import api from './api';

/**
 * Fetch scans for a specific time period
 */
export const getScansByPeriod = async (period = 'past7', limit = 50, page = 1) => {
  try {
    console.log('[ScansAPI] Fetching scans for period:', period, 'limit:', limit, 'page:', page);
    
    const response = await api.get('/analytics/scans/by-period', {
      params: {
        period,
        limit,
        page
      }
    });
    
    console.log('[ScansAPI] Success! Received', response.data.scans?.length || 0, 'scans');
    console.log('[ScansAPI] Response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('[ScansAPI] Error fetching scans by period:', error);
    console.error('[ScansAPI] Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data
    });
    throw error;
  }
};

/**
 * Fetch detailed information for a specific scan
 */
export const getScanDetails = async (scanId) => {
  try {
    console.log('[ScansAPI] Fetching scan details for ID:', scanId);
    
    const response = await api.get(`/analytics/scans/${scanId}`);
    
    console.log('[ScansAPI] Success! Received scan details');
    console.log('[ScansAPI] Scan data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('[ScansAPI] Error fetching scan details:', error);
    console.error('[ScansAPI] Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data
    });
    throw error;
  }
};

/**
 * Format device information for display
 */
export const formatDeviceInfo = (deviceInfo) => {
  if (!deviceInfo) {
    console.warn('[ScansAPI] No device info provided');
    return 'Unknown Device';
  }
  
  const parts = [];
  
  if (deviceInfo.deviceType) {
    parts.push(deviceInfo.deviceType.charAt(0).toUpperCase() + deviceInfo.deviceType.slice(1));
  }
  
  if (deviceInfo.os) {
    const osStr = deviceInfo.osVersion 
      ? `${deviceInfo.os} ${deviceInfo.osVersion}`
      : deviceInfo.os;
    parts.push(osStr);
  }
  
  if (deviceInfo.browser) {
    const browserStr = deviceInfo.browserVersion
      ? `${deviceInfo.browser} ${deviceInfo.browserVersion}`
      : deviceInfo.browser;
    parts.push(browserStr);
  }
  
  if (deviceInfo.device) {
    parts.push(deviceInfo.device);
  }
  
  const formatted = parts.join(' / ');
  console.log('[ScansAPI] Formatted device:', formatted);
  return formatted;
};

/**
 * Format location information for display
 */
export const formatLocation = (geo) => {
  if (!geo) {
    console.warn('[ScansAPI] No geo info provided');
    return 'Unknown Location';
  }
  
  const parts = [];
  
  // Build location string with available data
  if (geo.city) {
    parts.push(geo.city);
  }
  if (geo.region && geo.region !== geo.city) {
    parts.push(geo.region);
  }
  if (geo.country) {
    parts.push(geo.country);
  }
  
  const formatted = parts.filter(Boolean).join(', ') || 'Unknown Location';
  
  console.log('[ScansAPI] Formatted location:', {
    raw: geo,
    formatted: formatted
  });
  
  return formatted;
};

/**
 * Format timestamp for display
 */
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  
  return {
    date: date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }),
    time: date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false
    }),
    fullDateTime: date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  };
};

export default {
  getScansByPeriod,
  getScanDetails,
  formatDeviceInfo,
  formatLocation,
  formatTimestamp
};
