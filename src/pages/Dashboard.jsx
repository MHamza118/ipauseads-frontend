// src/pages/Dashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import scansApi from "../services/scansApi";
import { Archive, Calendar, CheckCircle, Copy, AlertTriangle, PlayCircle, Tv2, Youtube, Feather, Monitor, Music } from "lucide-react";

export default function Dashboard() {
  const [summary, setSummary] = useState({
    total: 0,
    registered: 0,
    conversions: 0,
    uniqueIps: 0,
    conversionRate: 0,
    devices: [],
    visitsByDate: []
  });
  const [spotlightData, setSpotlightData] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programScans, setProgramScans] = useState([]);
  const [showViewLogModal, setShowViewLogModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIpMetrics, setSelectedIpMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [showPauseOpportunitiesModal, setShowPauseOpportunitiesModal] = useState(false);
  const [activeTab, setActiveTab] = useState(null); // Track active tab - starts closed
  const [showPauseDetails, setShowPauseDetails] = useState(false);
  const [pauseDateFrom, setPauseDateFrom] = useState('02/20/2026');
  const [pauseDateTo, setPauseDateTo] = useState('02/26/2026');
  const [pauseTimePeriod, setPauseTimePeriod] = useState('past7'); // 'past7' or 'past30'

  // Demo data for pause opportunities
  const pauseDemoData = {
    past7: {
      totalOpportunities: '14,256',
      averageDuration: '45 sec',
      totalConversions: '8,934',
      clickThroughRate: '62.5%',
      dateFrom: '02/20/2026',
      dateTo: '02/26/2026',
      publishers: [
        { name: 'Tubi', icon: 'tubi-icon', opportunities: '14,256', duration: '45 sec', conversions: '8,934', percentage: '62.5%' },
        { name: 'Hulu', icon: 'hulu-icon', opportunities: '32,145', duration: '52 sec', conversions: '19,234', percentage: '59.8%' },
        { name: 'YouTube', icon: 'youtube-icon', opportunities: '28,934', duration: '38 sec', conversions: '15,678', percentage: '54.2%' },
        { name: 'Peacock', icon: 'peacock-icon', opportunities: '19,867', duration: '41 sec', conversions: '11,234', percentage: '56.3%' }
      ]
    },
    past30: {
      totalOpportunities: '58,432',
      averageDuration: '48 sec',
      totalConversions: '36,782',
      clickThroughRate: '62.9%',
      dateFrom: '01/28/2026',
      dateTo: '02/26/2026',
      publishers: [
        { name: 'Tubi', icon: 'tubi-icon', opportunities: '58,432', duration: '48 sec', conversions: '36,782', percentage: '63.0%' },
        { name: 'Hulu', icon: 'hulu-icon', opportunities: '125,678', duration: '55 sec', conversions: '79,456', percentage: '63.2%' },
        { name: 'YouTube', icon: 'youtube-icon', opportunities: '112,345', duration: '42 sec', conversions: '68,234', percentage: '60.7%' },
        { name: 'Peacock', icon: 'peacock-icon', opportunities: '78,912', duration: '44 sec', conversions: '47,890', percentage: '60.7%' }
      ]
    }
  };

  const currentPauseData = pauseDemoData[pauseTimePeriod];
  
  // Demo QR scan data for verified conversions
  const qrScanDemoData = {
    past7: [
      { date: 'Feb 26, 2026', time: '20:50:13', qrCode: 'Tubi -STARBUCKS-001', timestamp: 'Feb 26, 2026 at 20:50:13', city: 'New York, NY, US', campaign: 'Tubi Q1-2026', device: 'Mobile / Android 10 / Mobile Chrome 143.0.0.0 / K', publisher: 'Tubi', status: 'Converted', browser: 'Mobile Chrome 143.0.0.0' },
      { date: 'Feb 26, 2026', time: '18:32:45', qrCode: 'Hulu -NIKE-005', timestamp: 'Feb 26, 2026 at 18:32:45', city: 'Los Angeles, CA, US', campaign: 'Hulu Spring-2026', device: 'Mobile / iOS 17 / Safari 17.2 / iPhone 15', publisher: 'Hulu', status: 'Converted', browser: 'Safari 17.2' },
      { date: 'Feb 25, 2026', time: '22:15:30', qrCode: 'YouTube -TESLA-012', timestamp: 'Feb 25, 2026 at 22:15:30', city: 'Chicago, IL, US', campaign: 'YouTube Tech-2026', device: 'Mobile / Android 13 / Chrome 142.0.0.0 / Samsung S23', publisher: 'YouTube', status: 'Converted', browser: 'Chrome 142.0.0.0' },
      { date: 'Feb 25, 2026', time: '16:45:22', qrCode: 'Peacock -PEPSI-008', timestamp: 'Feb 25, 2026 at 16:45:22', city: 'Miami, FL, US', campaign: 'Peacock Summer-2026', device: 'Mobile / iOS 16 / Safari 16.5 / iPhone 14', publisher: 'Peacock', status: 'Converted', browser: 'Safari 16.5' },
      { date: 'Feb 24, 2026', time: '14:20:18', qrCode: 'Tubi -MCDONALDS-003', timestamp: 'Feb 24, 2026 at 14:20:18', city: 'Houston, TX, US', campaign: 'Tubi Q1-2026', device: 'Mobile / Android 12 / Chrome 141.0.0.0 / Pixel 7', publisher: 'Tubi', status: 'Converted', browser: 'Chrome 141.0.0.0' }
    ],
    past30: [
      { date: 'Feb 26, 2026', time: '20:50:13', qrCode: 'Tubi -STARBUCKS-001', timestamp: 'Feb 26, 2026 at 20:50:13', city: 'New York, NY, US', campaign: 'Tubi Q1-2026', device: 'Mobile / Android 10 / Mobile Chrome 143.0.0.0 / K', publisher: 'Tubi', status: 'Converted', browser: 'Mobile Chrome 143.0.0.0' },
      { date: 'Feb 26, 2026', time: '18:32:45', qrCode: 'Hulu -NIKE-005', timestamp: 'Feb 26, 2026 at 18:32:45', city: 'Los Angeles, CA, US', campaign: 'Hulu Spring-2026', device: 'Mobile / iOS 17 / Safari 17.2 / iPhone 15', publisher: 'Hulu', status: 'Converted', browser: 'Safari 17.2' },
      { date: 'Feb 25, 2026', time: '22:15:30', qrCode: 'YouTube -TESLA-012', timestamp: 'Feb 25, 2026 at 22:15:30', city: 'Chicago, IL, US', campaign: 'YouTube Tech-2026', device: 'Mobile / Android 13 / Chrome 142.0.0.0 / Samsung S23', publisher: 'YouTube', status: 'Converted', browser: 'Chrome 142.0.0.0' },
      { date: 'Feb 24, 2026', time: '14:20:18', qrCode: 'Tubi -MCDONALDS-003', timestamp: 'Feb 24, 2026 at 14:20:18', city: 'Houston, TX, US', campaign: 'Tubi Q1-2026', device: 'Mobile / Android 12 / Chrome 141.0.0.0 / Pixel 7', publisher: 'Tubi', status: 'Converted', browser: 'Chrome 141.0.0.0' },
      { date: 'Feb 22, 2026', time: '19:40:55', qrCode: 'Peacock -PEPSI-008', timestamp: 'Feb 22, 2026 at 19:40:55', city: 'Miami, FL, US', campaign: 'Peacock Summer-2026', device: 'Mobile / iOS 16 / Safari 16.5 / iPhone 14', publisher: 'Peacock', status: 'Converted', browser: 'Safari 16.5' },
      { date: 'Feb 20, 2026', time: '13:25:40', qrCode: 'Hulu -AMAZON-020', timestamp: 'Feb 20, 2026 at 13:25:40', city: 'Seattle, WA, US', campaign: 'Hulu Spring-2026', device: 'Mobile / Android 13 / Chrome 143.0.0.0 / OnePlus 11', publisher: 'Hulu', status: 'Converted', browser: 'Chrome 143.0.0.0' },
      { date: 'Feb 18, 2026', time: '11:10:25', qrCode: 'YouTube -FORD-015', timestamp: 'Feb 18, 2026 at 11:10:25', city: 'Detroit, MI, US', campaign: 'YouTube Auto-2026', device: 'Mobile / iOS 17 / Safari 17.3 / iPhone 15 Pro', publisher: 'YouTube', status: 'Converted', browser: 'Safari 17.3' },
      { date: 'Feb 15, 2026', time: '16:55:30', qrCode: 'Tubi -WALMART-007', timestamp: 'Feb 15, 2026 at 16:55:30', city: 'Dallas, TX, US', campaign: 'Tubi Retail-2026', device: 'Mobile / Android 11 / Chrome 142.0.0.0 / Moto G', publisher: 'Tubi', status: 'Converted', browser: 'Chrome 142.0.0.0' },
      { date: 'Feb 12, 2026', time: '20:30:15', qrCode: 'Peacock -DISNEY-022', timestamp: 'Feb 12, 2026 at 20:30:15', city: 'Orlando, FL, US', campaign: 'Peacock Entertainment-2026', device: 'Mobile / iOS 16 / Safari 16.6 / iPhone 13', publisher: 'Peacock', status: 'Converted', browser: 'Safari 16.6' },
      { date: 'Feb 10, 2026', time: '09:45:50', qrCode: 'Hulu -APPLE-018', timestamp: 'Feb 10, 2026 at 09:45:50', city: 'San Francisco, CA, US', campaign: 'Hulu Tech-2026', device: 'Mobile / iOS 17 / Safari 17.2 / iPhone 15', publisher: 'Hulu', status: 'Converted', browser: 'Safari 17.2' },
      { date: 'Feb 08, 2026', time: '15:20:35', qrCode: 'YouTube -SONY-025', timestamp: 'Feb 08, 2026 at 15:20:35', city: 'Las Vegas, NV, US', campaign: 'YouTube Electronics-2026', device: 'Mobile / Android 13 / Chrome 143.0.0.0 / Galaxy S24', publisher: 'YouTube', status: 'Converted', browser: 'Chrome 143.0.0.0' },
      { date: 'Feb 05, 2026', time: '12:10:20', qrCode: 'Tubi -TARGET-011', timestamp: 'Feb 05, 2026 at 12:10:20', city: 'Minneapolis, MN, US', campaign: 'Tubi Retail-2026', device: 'Mobile / iOS 16 / Safari 16.5 / iPhone 14', publisher: 'Tubi', status: 'Converted', browser: 'Safari 16.5' },
      { date: 'Feb 02, 2026', time: '18:55:45', qrCode: 'Peacock -NETFLIX-030', timestamp: 'Feb 02, 2026 at 18:55:45', city: 'Boston, MA, US', campaign: 'Peacock Streaming-2026', device: 'Mobile / Android 12 / Chrome 142.0.0.0 / Pixel 8', publisher: 'Peacock', status: 'Converted', browser: 'Chrome 142.0.0.0' },
      { date: 'Jan 30, 2026', time: '21:40:10', qrCode: 'Hulu -UBER-014', timestamp: 'Jan 30, 2026 at 21:40:10', city: 'Atlanta, GA, US', campaign: 'Hulu Services-2026', device: 'Mobile / iOS 17 / Safari 17.2 / iPhone 15', publisher: 'Hulu', status: 'Converted', browser: 'Safari 17.2' },
      { date: 'Jan 28, 2026', time: '10:25:55', qrCode: 'YouTube -ADIDAS-009', timestamp: 'Jan 28, 2026 at 10:25:55', city: 'Portland, OR, US', campaign: 'YouTube Sports-2026', device: 'Mobile / Android 13 / Chrome 143.0.0.0 / OnePlus 12', publisher: 'YouTube', status: 'Converted', browser: 'Chrome 143.0.0.0' }
    ]
  };
  
  const [showVerifiedConversionsModal, setShowVerifiedConversionsModal] = useState(false);
  const [showConversionsDetails, setShowConversionsDetails] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [qrTimePeriod, setQrTimePeriod] = useState('past7'); // 'past7' or 'past30'

  // Demo data for QR conversions summary
  const qrConversionsSummaryData = {
    past7: {
      totalConversions: '8,934',
      uniqueEngagements: '8,127',
      duplicates: '47',
      invalidTraffic: '12'
    },
    past30: {
      totalConversions: '36,782',
      uniqueEngagements: '33,456',
      duplicates: '189',
      invalidTraffic: '48'
    }
  };

  const currentQrData = qrConversionsSummaryData[qrTimePeriod];

  // Demo data for quality controls
  const qualityControlData = {
    uniqueIds: {
      past7: {
        total: 500,
        dateRange: 'Feb 20-26, 2026 (Past 7 Days)',
        ids: ['CONV-2026-001847', 'CONV-2026-001846', 'CONV-2026-001845', 'CONV-2026-001844', 'CONV-2026-001843', 'CONV-2026-001842', 'CONV-2026-001841', 'CONV-2026-001840', 'CONV-2026-001839', 'CONV-2026-001838']
      },
      past30: {
        total: 2100,
        dateRange: 'Jan 28 - Feb 26, 2026 (Past 30 Days)',
        ids: ['CONV-2026-002100', 'CONV-2026-002099', 'CONV-2026-002098', 'CONV-2026-002097', 'CONV-2026-002096', 'CONV-2026-002095', 'CONV-2026-002094', 'CONV-2026-002093', 'CONV-2026-002092', 'CONV-2026-002091']
      }
    },
    duplicates: {
      past7: {
        total: 12,
        dateRange: 'Feb 20-26, 2026 (Past 7 Days)',
        groups: [
          {ip: '192.168.1.45', code: 'Tubi-STARBUCKS-001', time: 'Feb 26, 14:32:15', count: 3, window: '2.1 sec'},
          {ip: '192.168.1.78', code: 'Hulu-NIKE-005', time: 'Feb 25, 13:47:33', count: 2, window: '1.8 sec'},
          {ip: '192.168.2.12', code: 'YouTube-TESLA-012', time: 'Feb 24, 12:58:47', count: 4, window: '2.9 sec'},
          {ip: '192.168.1.102', code: 'Peacock-PEPSI-008', time: 'Feb 23, 15:19:28', count: 2, window: '1.5 sec'},
          {ip: '192.168.3.56', code: 'Tubi-MCDONALDS-003', time: 'Feb 22, 14:56:03', count: 3, window: '2.3 sec'}
        ]
      },
      past30: {
        total: 47,
        dateRange: 'Jan 28 - Feb 26, 2026 (Past 30 Days)',
        groups: [
          {ip: '192.168.1.145', code: 'Tubi-STARBUCKS-001', time: 'Feb 26, 14:32:15', count: 5, window: '3.2 sec'},
          {ip: '192.168.1.178', code: 'Hulu-NIKE-005', time: 'Feb 24, 13:47:33', count: 3, window: '2.1 sec'},
          {ip: '192.168.2.212', code: 'YouTube-TESLA-012', time: 'Feb 20, 12:58:47', count: 6, window: '3.5 sec'},
          {ip: '192.168.1.202', code: 'Peacock-PEPSI-008', time: 'Feb 15, 15:19:28', count: 4, window: '2.8 sec'},
          {ip: '192.168.3.156', code: 'Tubi-WALMART-007', time: 'Feb 10, 14:56:03', count: 5, window: '3.1 sec'},
          {ip: '192.168.4.89', code: 'Hulu-APPLE-018', time: 'Feb 5, 11:23:45', count: 3, window: '2.4 sec'},
          {ip: '192.168.5.67', code: 'YouTube-SONY-025', time: 'Jan 30, 16:42:12', count: 4, window: '2.9 sec'}
        ]
      }
    },
    invalidTraffic: {
      past7: {
        total: 8,
        dateRange: 'Feb 20-26, 2026 (Past 7 Days)',
        categories: {
          rapidScans: 2,
          botPattern: 1,
          suspiciousAgent: 1,
          unusualGeo: 1,
          proxyVpn: 0
        },
        logs: [
          {ip: '203.0.113.45', time: 'Feb 26, 14:32:15', type: 'Rapid Sequential Scans', risk: 'High', reason: '50+ scans in 10 seconds'},
          {ip: '198.51.100.78', time: 'Feb 25, 13:47:33', type: 'Bot Pattern Detected', risk: 'High', reason: 'Automated scanning pattern detected'},
          {ip: '192.0.2.12', time: 'Feb 24, 12:58:47', type: 'Unusual Geolocation', risk: 'Medium', reason: '5+ countries in 5 minutes'},
          {ip: '203.0.113.102', time: 'Feb 23, 15:19:28', type: 'Rapid Sequential Scans', risk: 'High', reason: '100+ scans in 30 seconds'},
          {ip: '198.51.100.56', time: 'Feb 22, 14:56:03', type: 'Suspicious User Agent', risk: 'Medium', reason: 'Known bot user agent detected'}
        ]
      },
      past30: {
        total: 31,
        dateRange: 'Jan 28 - Feb 26, 2026 (Past 30 Days)',
        categories: {
          rapidScans: 8,
          botPattern: 4,
          suspiciousAgent: 3,
          unusualGeo: 2,
          proxyVpn: 1
        },
        logs: [
          {ip: '203.0.113.245', time: 'Feb 26, 14:32:15', type: 'Rapid Sequential Scans', risk: 'High', reason: '80+ scans in 15 seconds'},
          {ip: '198.51.100.178', time: 'Feb 24, 13:47:33', type: 'Bot Pattern Detected', risk: 'High', reason: 'Automated scanning pattern detected'},
          {ip: '192.0.2.112', time: 'Feb 20, 12:58:47', type: 'Unusual Geolocation', risk: 'Medium', reason: '8+ countries in 10 minutes'},
          {ip: '203.0.113.202', time: 'Feb 15, 15:19:28', type: 'Rapid Sequential Scans', risk: 'High', reason: '120+ scans in 40 seconds'},
          {ip: '198.51.100.156', time: 'Feb 10, 14:56:03', type: 'Suspicious User Agent', risk: 'Medium', reason: 'Known bot user agent detected'},
          {ip: '192.0.2.89', time: 'Feb 5, 11:23:45', type: 'Proxy/VPN Usage', risk: 'Medium', reason: 'Traffic from known VPN service'},
          {ip: '203.0.113.67', time: 'Jan 30, 16:42:12', type: 'Bot Pattern Detected', risk: 'High', reason: 'Consistent 1-second intervals detected'}
        ]
      }
    }
  };

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [expandedPublisher, setExpandedPublisher] = useState(null);
  const [showAttentionSpotlightModal, setShowAttentionSpotlightModal] = useState(false);
  const [showAttentionDetails, setShowAttentionDetails] = useState(false);
  const [attentionMetrics, setAttentionMetrics] = useState(null);
  const [attentionLoading, setAttentionLoading] = useState(false);
  const [showTimestampModal, setShowTimestampModal] = useState(false);
  const [timestampPeriod, setTimestampPeriod] = useState(null); // 'past7' or 'past30'
  const [showConversionIdsModal, setShowConversionIdsModal] = useState(false);
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);
  const [showInvalidTrafficModal, setShowInvalidTrafficModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedLogRow, setSelectedLogRow] = useState(null);
  const [activeQualityControl, setActiveQualityControl] = useState(null); // Track active quality control inline view
  const [scansData, setScansData] = useState([]);
  const [scansLoading, setScansLoading] = useState(false);
  const [scansError, setScansError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  const logDetailsRef = useRef(null);

  // Update date in real-time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to conversion logs when opened
  useEffect(() => {
    if (selectedLogRow && logDetailsRef.current) {
      setTimeout(() => {
        logDetailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [selectedLogRow]);

  // Filter states (still used for analytics summary)
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    deviceType: "All",
    conversionStatus: "All",
    ip: "",
    qrId: ""
  });

  // Mobile filter toggle (start expanded so desktop shows filters)
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);

  const buildQueryString = (extraParams = {}) => {
    const params = new URLSearchParams();
    if (filters.from) params.append("from", filters.from);
    if (filters.to) params.append("to", filters.to);
    if (filters.deviceType && filters.deviceType !== "All")
      params.append("deviceType", filters.deviceType);
    if (filters.conversionStatus && filters.conversionStatus !== "All")
      params.append("conversionStatus", filters.conversionStatus);
    if (filters.ip) params.append("ip", filters.ip);
    if (filters.qrId) params.append("qrId", filters.qrId);
    Object.entries(extraParams).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return params.toString();
  };

  const fetchSummary = async () => {
    const queryString = buildQueryString({ days: 7 });
    const res = await api.get(`/analytics/summary?${queryString}`);

    const apiData = res.data || {};

    if (apiData.summary) {
      const s = apiData.summary;
      const devices = (apiData.breakdowns && apiData.breakdowns.devices) || [];
      const visits = Array.isArray(apiData.timeSeries)
        ? apiData.timeSeries.map((v) => ({
            _id: v.date,
            count: v.scans
          }))
        : [];

      setSummary({
        total: s.totalScans ?? 0,
        registered: s.totalRegisteredUsers ?? 0,
        conversions: s.totalConversions ?? 0,
        uniqueIps: s.uniqueVisitors ?? 0,
        conversionRate:
          typeof s.conversionRate === "number" ? s.conversionRate.toFixed(2) : 0,
        devices,
        visitsByDate: visits
      });
    } else {
      setSummary({
        total: apiData.total ?? 0,
        registered: apiData.registered ?? 0,
        conversions: apiData.conversions ?? 0,
        uniqueIps: apiData.uniqueIps ?? 0,
        conversionRate: apiData.conversionRate ?? 0,
        devices: apiData.devices || [],
        visitsByDate: apiData.visitsByDate || []
      });
    }
  };

  const fetchSpotlightData = async () => {
    try {
      setLoading(true);
      const queryString = buildQueryString();
      const url = queryString
        ? `/api/scans/spotlight?${queryString}`
        : "/api/scans/spotlight";
      const res = await api.get(url);
      setSpotlightData(res.data.programs || []);
    } catch (error) {
      console.error("Error fetching spotlight data:", error);
      alert("Failed to load spotlight data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttentionMetrics = async () => {
    try {
      setAttentionLoading(true);
      const res = await api.get('/a2ar/summary?days=7');
      console.log('Attention metrics response:', res.data);
      setAttentionMetrics(res.data);
    } catch (error) {
      console.error("Error fetching attention metrics:", error);
      setAttentionMetrics(null);
    } finally {
      setAttentionLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchSpotlightData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.from, filters.to, filters.deviceType, filters.conversionStatus, filters.ip, filters.qrId]);

  // Fetch scans when timestamp modal opens
  useEffect(() => {
    if (showTimestampModal && timestampPeriod) {
      fetchScansForPeriod();
    }
  }, [showTimestampModal, timestampPeriod]);

  // Fetch attention metrics when modal opens
  useEffect(() => {
    if (showAttentionSpotlightModal) {
      fetchAttentionMetrics();
    }
  }, [showAttentionSpotlightModal]);

  const fetchScansForPeriod = async () => {
    try {
      setScansLoading(true);
      setScansError(null);
      
      const data = await scansApi.getScansByPeriod(timestampPeriod, 50, 1);
      
      setScansData(data.scans || []);
    } catch (error) {
      setScansError('Failed to load scans data');
      setScansData([]);
    } finally {
      setScansLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      from: "",
      to: "",
      deviceType: "All",
      conversionStatus: "All",
      ip: "",
      qrId: ""
    });
  };

  const handleViewLog = async (program) => {
    try {
      setSelectedProgram(program);
      setShowViewLogModal(true);
      setSelectedIpMetrics(null);
      const key = program.series_title || program.qr_id;
      const res = await api.get(
        `/api/scans/by-program/${encodeURIComponent(key)}`
      );
      setProgramScans(res.data.scans || []);
    } catch (error) {
      console.error("Error fetching program scans:", error);
      alert("Failed to load scan details");
    }
  };

  // Fetch per-IP attention metrics
  const handleViewIpMetrics = async (ipAddress) => {
    try {
      setMetricsLoading(true);
      const res = await api.get(`/api/scans/metrics-by-ip/${encodeURIComponent(ipAddress)}`);
      setSelectedIpMetrics(res.data);
    } catch (error) {
      console.error("Error fetching IP metrics:", error);
      alert("Failed to load metrics for this IP");
    } finally {
      setMetricsLoading(false);
    }
  };

  const exportToCSV = (rows) => {
    if (!rows || rows.length === 0) {
      alert("No data to export");
      return;
    }

    const header = [
      "Timestamp",
      "Date",
      "QR ID",
      "IP Address",
      "Device",
      "Conversion",
      "Conversion Action"
    ];

    const lines = rows.map((scan) => {
      const ts = new Date(scan.timestamp);
      const dateStr = ts.toLocaleDateString();
      const timeStr = ts.toLocaleTimeString();
      return [
        timeStr,
        dateStr,
        scan.qr_id,
        scan.ip_address,
        scan.device,
        scan.conversion ? "Yes" : "No",
        scan.conversionAction || (scan.conversion ? "Converted" : "No Conversion")
      ]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",");
    });

    const csvContent = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `program_scans_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const visits = (summary.visitsByDate || []).map((v) => ({
    date: v._id,
    count: v.count
  }));

  const deviceData = (summary.devices || []).map((d) => ({
    name: d._id || "unknown",
    count: d.count,
    percentage: summary.total > 0 ? ((d.count / summary.total) * 100).toFixed(1) : 0
  }));

  const COLORS = ["#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];

  return (
    <div className="dashboard">
      {/* Filters Sidebar */}
      <div className={`filters ${filtersCollapsed ? "collapsed" : ""}`}>
        <button
          className="filter-toggle"
          onClick={() => setFiltersCollapsed(!filtersCollapsed)}
        >
          {filtersCollapsed ? "Show Filters" : "Hide Filters"}
          <span className={`filter-toggle-icon ${filtersCollapsed ? "" : "open"}`}>
            ▼
          </span>
        </button>

        <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>Filters</h3>

        <div className="filter-group">
          <label className="filter-label">Date Range</label>
          <input
            type="date"
            className="filter-input"
            value={filters.from}
            onChange={(e) => handleFilterChange("from", e.target.value)}
            placeholder="From"
          />
          <input
            type="date"
            className="filter-input"
            value={filters.to}
            onChange={(e) => handleFilterChange("to", e.target.value)}
            placeholder="To"
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Device Type</label>
          <select
            className="filter-input"
            value={filters.deviceType}
            onChange={(e) => handleFilterChange("deviceType", e.target.value)}
          >
            <option value="All">All Devices</option>
            <option value="Desktop">Desktop</option>
            <option value="Mobile">Mobile</option>
            <option value="Tablet">Tablet</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Conversions Status</label>
          <select
            className="filter-input"
            value={filters.conversionStatus}
            onChange={(e) => handleFilterChange("conversionStatus", e.target.value)}
          >
            <option value="All">All</option>
            <option value="Converted">Converted</option>
            <option value="Not Converted">Not Converted</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Search by IP</label>
          <input
            type="text"
            className="filter-input"
            value={filters.ip}
            onChange={(e) => handleFilterChange("ip", e.target.value)}
            placeholder="Enter IP address"
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Search by QR ID</label>
          <input
            type="text"
            className="filter-input"
            value={filters.qrId}
            onChange={(e) => handleFilterChange("qrId", e.target.value)}
            placeholder="Enter QR ID"
          />
        </div>

        <button
          className="btn primary"
          style={{ width: "100%", marginTop: 8 }}
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>

      {/* Main Content */}
      <div className="main">
        {/* Professional Header */}
        <div className="professional-header">
          <div className="header-content">
            <div className="message-center-label">
              <span className="message-text">MESSAGE CENTER</span>
              <span className="message-count">2</span>
            </div>
            <h1 className="header-title">iPause Performance Ledger</h1>
            <div className="header-date">
              <span id="todays-date">
                {currentDate}
              </span>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="refresh-btn">
            ↻ Refresh
          </button>
        </div>

        {/* Main Performance Ledger Grid */}
        <div className="performance-ledger">
          {/* Pause Opportunities Card */}
          <div 
            className="ledger-card pause-opportunities-card"
            onClick={() => {
              if (activeTab === 'pause') {
                setActiveTab(null);
              } else {
                setActiveTab('pause');
              }
              setShowPauseOpportunitiesModal(false);
              setShowVerifiedConversionsModal(false);
              setShowAttentionSpotlightModal(false);
              setShowWalletModal(false);
              setShowPauseDetails(false);
              setActiveQualityControl(null);
            }}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                if (activeTab === 'pause') {
                  setActiveTab(null);
                } else {
                  setActiveTab('pause');
                }
                setShowPauseOpportunitiesModal(false);
                setShowVerifiedConversionsModal(false);
                setShowAttentionSpotlightModal(false);
                setShowWalletModal(false);
              }
            }}
          >
            <div className="card-header">
              <h3 className="card-label">PAUSE OPPORTUNITIES</h3>
            </div>
            <div className="card-content">
              <div className="card-icon">📺</div>
              <p className="card-description">Video completion and ad visibility metrics</p>
            </div>
            <div className="card-footer">
              <span className="view-details">View Details →</span>
            </div>
          </div>

          {/* Verified QR Conversions Card */}
          <div 
            className="ledger-card verified-conversions-card"
            onClick={() => {
              if (activeTab === 'conversions') {
                setActiveTab(null);
              } else {
                setActiveTab('conversions');
              }
              setShowPauseOpportunitiesModal(false);
              setShowVerifiedConversionsModal(false);
              setShowAttentionSpotlightModal(false);
              setShowWalletModal(false);
              setShowConversionsDetails(false);
              setActiveQualityControl(null);
            }}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                if (activeTab === 'conversions') {
                  setActiveTab(null);
                } else {
                  setActiveTab('conversions');
                }
                setShowPauseOpportunitiesModal(false);
                setShowVerifiedConversionsModal(false);
                setShowAttentionSpotlightModal(false);
                setShowWalletModal(false);
              }
            }}
          >
            <div className="card-header">
              <h3 className="card-label">VERIFIED QR CONVERSIONS</h3>
            </div>
            <div className="card-content">
              <div className="card-icon">✓</div>
              <p className="card-description">Confirmed consumer interactions and conversions</p>
            </div>
            <div className="card-footer">
              <span className="view-details">View Details →</span>
            </div>
          </div>

          {/* Attention Spotlight Card */}
          <div 
            className="ledger-card attention-spotlight-card"
            onClick={() => {
              if (activeTab === 'spotlight') {
                setActiveTab(null);
              } else {
                setActiveTab('spotlight');
              }
              setShowPauseOpportunitiesModal(false);
              setShowVerifiedConversionsModal(false);
              setShowAttentionSpotlightModal(false);
              setShowWalletModal(false);
              setShowAttentionDetails(false);
              setActiveQualityControl(null);
            }}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                if (activeTab === 'spotlight') {
                  setActiveTab(null);
                } else {
                  setActiveTab('spotlight');
                }
                setShowPauseOpportunitiesModal(false);
                setShowVerifiedConversionsModal(false);
                setShowAttentionSpotlightModal(false);
                setShowWalletModal(false);
              }
            }}
          >
            <div className="card-header">
              <h3 className="card-label">ATTENTION SPOTLIGHT</h3>
            </div>
            <div className="card-content">
              <div className="card-icon">📊</div>
              <p className="card-description">Audience conversion performance analysis</p>
            </div>
            <div className="card-footer">
              <span className="view-details">View Details →</span>
            </div>
          </div>

          {/* Wallet (Verified Spend) Card */}
          <div 
            className="ledger-card wallet-card"
            onClick={() => {
              if (activeTab === 'wallet') {
                setActiveTab(null);
              } else {
                setActiveTab('wallet');
              }
              setShowPauseOpportunitiesModal(false);
              setShowVerifiedConversionsModal(false);
              setShowAttentionSpotlightModal(false);
              setShowWalletModal(false);
              setShowWalletDetails(false);
              setActiveQualityControl(null);
            }}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                if (activeTab === 'wallet') {
                  setActiveTab(null);
                } else {
                  setActiveTab('wallet');
                }
                setShowPauseOpportunitiesModal(false);
                setShowVerifiedConversionsModal(false);
                setShowAttentionSpotlightModal(false);
                setShowWalletModal(false);
              }
            }}
          >
            <div className="card-header">
              <h3 className="card-label">WALLET (VERIFIED SPEND)</h3>
            </div>
            <div className="card-content">
              <div className="card-icon">💰</div>
              <p className="card-description">Budget allocation and spend tracking</p>
            </div>
            <div className="card-footer">
              <span className="view-details">View Details →</span>
            </div>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="tab-content-area">
          {activeTab === 'pause' && (
            <div className="content-section">
              <header className="modal-header professional-modal-header">
                <div>
                  <h2>Pause Opportunities</h2>
                </div>
              </header>
              <div className="modal-body">
                {!showPauseDetails ? (
                  <>
                    {/* Summary View - Image 1 with 4 metric boxes */}
                    <div className="pause-summary-view">
                      {/* Date Range Section */}
                      <div className="date-range-section-summary">
                        <div className="date-range-boxes">
                          <div 
                            className={`date-box ${pauseTimePeriod === 'past7' ? 'date-box-selected' : ''}`}
                            onClick={() => setPauseTimePeriod('past7')}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="date-box-checkbox-wrapper">
                              <input 
                                type="checkbox" 
                                checked={pauseTimePeriod === 'past7'}
                                onChange={() => setPauseTimePeriod('past7')}
                                className="date-checkbox"
                              />
                              <label className="date-box-label">PAST 7 DAYS</label>
                            </div>
                            <div className="date-display">
                              <span>From</span>
                              <input 
                                type="text" 
                                value={pauseTimePeriod === 'past7' ? currentPauseData.dateFrom : '__/__/__'} 
                                className="compact-date-input" 
                                readOnly
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span>To</span>
                              <input 
                                type="text" 
                                value={pauseTimePeriod === 'past7' ? currentPauseData.dateTo : '__/__/__'} 
                                className="compact-date-input" 
                                readOnly
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          <div 
                            className={`date-box ${pauseTimePeriod === 'past30' ? 'date-box-selected' : ''}`}
                            onClick={() => setPauseTimePeriod('past30')}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="date-box-checkbox-wrapper">
                              <input 
                                type="checkbox" 
                                checked={pauseTimePeriod === 'past30'}
                                onChange={() => setPauseTimePeriod('past30')}
                                className="date-checkbox"
                              />
                              <label className="date-box-label">PAST 30 DAYS</label>
                            </div>
                            <div className="date-display">
                              <span>From</span>
                              <input 
                                type="text" 
                                value={pauseTimePeriod === 'past30' ? currentPauseData.dateFrom : '__/__/__'} 
                                className="compact-date-input" 
                                readOnly
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span>To</span>
                              <input 
                                type="text" 
                                value={pauseTimePeriod === 'past30' ? currentPauseData.dateTo : '__/__/__'} 
                                className="compact-date-input" 
                                readOnly
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 4 Metric Boxes */}
                      <div className="pause-metrics-grid">
                        <div className="pause-metric-box">
                          <h3 className="metric-box-header-large">TOTAL<br/>OPPORTUNITIES</h3>
                          <div className="metric-box-value">{currentPauseData.totalOpportunities}</div>
                        </div>
                        <div className="pause-metric-box">
                          <h3 className="metric-box-header-large">AVERAGE<br/>DURATION</h3>
                          <div className="metric-box-value">{currentPauseData.averageDuration}</div>
                        </div>
                        <div className="pause-metric-box">
                          <h3 className="metric-box-header-large">TOTAL QR<br/>CONVERSIONS</h3>
                          <div className="metric-box-value">{currentPauseData.totalConversions}</div>
                        </div>
                        <div className="pause-metric-box">
                          <h3 className="metric-box-header-large">CLICK THROUGH<br/>RATE</h3>
                          <div className="metric-box-value">{currentPauseData.clickThroughRate}</div>
                        </div>
                      </div>

                      {/* Counting Criteria Info */}
                      <div className="criteria-info-box">
                        <p><strong>Counting Criteria:</strong> Only pause events where the video reached 100% completion and the QR code was rendered and viewable are counted.</p>
                      </div>

                      {/* View Details Button */}
                      <div className="action-buttons-center">
                        <button 
                          className="details-btn"
                          onClick={() => setShowPauseDetails(true)}
                        >
                          VIEW DETAILS
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Detailed View - Image 2 with publisher table */}
                    <div className="modal-body pause-table-modal-body">
                      {/* Selected Period Badge - Top Section */}
                      <div className="selected-period-header">
                        <div className="selected-period-badge">
                          {pauseTimePeriod === 'past7' ? 'PAST 7 DAYS' : 'PAST 30 DAYS'}
                        </div>
                        <div className="selected-period-dates">
                          {currentPauseData.dateFrom} → {currentPauseData.dateTo}
                        </div>
                      </div>

                      {/* Professional Table with Publishers on Left */}
                      <div className="pause-table-container">
                        <table className="pause-opportunities-table-new">
                          <thead>
                            <tr>
                              <th className="publisher-col-header">PUBLISHER</th>
                              <th className="number-col">TOTAL<br/>OPPORTUNITIES</th>
                              <th className="number-col">AVERAGE<br/>DURATION</th>
                              <th className="number-col">TOTAL QR<br/>CONVERSIONS</th>
                              <th className="number-col">CLICK THROUGH<br/>PERCENTAGE</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentPauseData.publishers.map((publisher, index) => (
                              <tr key={index}>
                                <td className="publisher-col-cell">
                                  <div className={`publisher-icon-box ${publisher.icon}`}>
                                    {publisher.name === 'Tubi' && <PlayCircle size={20} />}
                                    {publisher.name === 'Hulu' && <Tv2 size={20} />}
                                    {publisher.name === 'YouTube' && <Youtube size={20} />}
                                    {publisher.name === 'Peacock' && <Feather size={20} />}
                                  </div>
                                  <span className="publisher-name">{publisher.name}</span>
                                </td>
                                <td><input type="text" className="cell-input-new" value={publisher.opportunities} onChange={() => {}} /></td>
                                <td><input type="text" className="cell-input-new" value={publisher.duration} onChange={() => {}} /></td>
                                <td><input type="text" className="cell-input-new" value={publisher.conversions} onChange={() => {}} /></td>
                                <td><input type="text" className="cell-input-new" value={publisher.percentage} onChange={() => {}} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Back Button */}
                      <div className="action-buttons-center" style={{ marginTop: '24px' }}>
                        <button 
                          className="back-btn"
                          onClick={() => setShowPauseDetails(false)}
                        >
                          ← Back
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          {activeTab === 'conversions' && (
            <div className="content-section">
              <header className="modal-header professional-modal-header">
                <div>
                  <h2>Verified QR Conversions</h2>
                </div>
              </header>
              <div className="modal-body">
                {!showConversionsDetails ? (
                  <>
                    {/* Summary View - Time Period Selection and Quality Controls */}
                    <div className="qr-conversions-summary-view">
                      {/* Time Period Selection */}
                      <div className="date-range-section-summary">
                        <div className="date-range-boxes">
                          <div 
                            className={`date-box ${qrTimePeriod === 'past7' ? 'date-box-selected' : ''}`}
                            onClick={() => setQrTimePeriod('past7')}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="date-box-checkbox-wrapper">
                              <input 
                                type="checkbox" 
                                checked={qrTimePeriod === 'past7'}
                                onChange={() => setQrTimePeriod('past7')}
                                className="date-checkbox"
                              />
                              <label className="date-box-label">PAST 7 DAYS</label>
                            </div>
                            <div className="qr-value-display">
                              {qrConversionsSummaryData.past7.totalConversions}
                            </div>
                          </div>
                          <div 
                            className={`date-box ${qrTimePeriod === 'past30' ? 'date-box-selected' : ''}`}
                            onClick={() => setQrTimePeriod('past30')}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="date-box-checkbox-wrapper">
                              <input 
                                type="checkbox" 
                                checked={qrTimePeriod === 'past30'}
                                onChange={() => setQrTimePeriod('past30')}
                                className="date-checkbox"
                              />
                              <label className="date-box-label">PAST 30 DAYS</label>
                            </div>
                            <div className="qr-value-display">
                              {qrConversionsSummaryData.past30.totalConversions}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quality Controls Section */}
                      <div className="quality-controls-summary">
                        <button 
                          className="quality-item-button"
                          onClick={() => {
                            setShowConversionsDetails(true);
                            setActiveQualityControl('uniqueIds');
                            setSelectedLogRow(null);
                          }}
                          title="Unique Engagements IDs"
                        >
                          <CheckCircle size={14} />
                          <span>Unique Engagements IDs</span>
                        </button>
                        <span className="quality-separator">|</span>
                        <button 
                          className="quality-item-button"
                          onClick={() => {
                            setShowConversionsDetails(true);
                            setActiveQualityControl('duplicates');
                            setSelectedLogRow(null);
                          }}
                          title="Duplicates"
                        >
                          <Copy size={14} />
                          <span>Duplicates</span>
                        </button>
                        <span className="quality-separator">|</span>
                        <button 
                          className="quality-item-button"
                          onClick={() => {
                            setShowConversionsDetails(true);
                            setActiveQualityControl('invalidTraffic');
                            setSelectedLogRow(null);
                          }}
                          title="Invalid Traffic"
                        >
                          <AlertTriangle size={14} />
                          <span>Invalid Traffic</span>
                        </button>
                        <span className="quality-separator">|</span>
                        <button 
                          className="quality-item-button"
                          onClick={() => {
                            setShowConversionsDetails(true);
                            setActiveQualityControl('archive');
                            setSelectedLogRow(null);
                          }}
                          title="View Archived Data"
                        >
                          <Archive size={14} />
                        </button>
                      </div>

                      {/* Details Button */}
                      <div className="action-buttons-center">
                        <button 
                          className="details-btn"
                          onClick={() => {
                            setShowConversionsDetails(true);
                            // Auto-select the timestamp view based on selected period
                            setActiveQualityControl(qrTimePeriod === 'past7' ? 'timestamp' : 'timestamp30');
                          }}
                        >
                          Details →
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Detailed View - Quality Controls */}
                    <div className="conversions-details">
                      <div className="detail-section">
                        {activeQualityControl && (
                          <>
                            <div style={{backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '16px'}}>
                              {activeQualityControl === 'timestamp' && (
                                <div>
                                  <div style={{backgroundColor: '#dbeafe', padding: '12px', borderRadius: '6px', marginBottom: '16px', borderLeft: '4px solid #0284c7'}}>
                                    <strong>Date Range: Feb 20-26, 2026 (Past 7 Days)</strong>
                                  </div>
                                  <h5>QR CODE SCANS</h5>
                                  <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '13px'}}>
                                    <thead>
                                      <tr style={{backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb'}}>
                                        <th style={{padding: '10px', textAlign: 'left', fontWeight: '600'}}>DATE</th>
                                        <th style={{padding: '10px', textAlign: 'left', fontWeight: '600'}}>TIME</th>
                                        <th style={{padding: '10px', textAlign: 'left', fontWeight: '600'}}>QR CODE SCANNED</th>
                                        <th style={{padding: '10px', textAlign: 'center', fontWeight: '600'}}>LOGS</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {qrScanDemoData.past7.map((scan, idx) => (
                                        <tr key={idx} style={{borderBottom: '1px solid #e5e7eb'}}>
                                          <td style={{padding: '10px'}}>{scan.date}</td>
                                          <td style={{padding: '10px'}}>{scan.time}</td>
                                          <td style={{padding: '10px', fontWeight: '500', color: '#0284c7'}}>{scan.qrCode}</td>
                                          <td style={{padding: '10px', textAlign: 'center'}}>
                                            <button 
                                              onClick={() => {
                                                setSelectedLogRow(selectedLogRow?.timestamp === scan.timestamp ? null : scan);
                                              }}
                                              style={{
                                                padding: '6px 16px',
                                                backgroundColor: selectedLogRow?.timestamp === scan.timestamp ? '#0369a1' : '#0284c7',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s'
                                              }}
                                              onMouseEnter={(e) => e.target.style.backgroundColor = '#0369a1'}
                                              onMouseLeave={(e) => e.target.style.backgroundColor = selectedLogRow?.timestamp === scan.timestamp ? '#0369a1' : '#0284c7'}
                                            >
                                              {selectedLogRow?.timestamp === scan.timestamp ? 'Hide' : 'View'}
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  {selectedLogRow && (
                                    <div ref={logDetailsRef} style={{marginTop: '20px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px'}}>
                                      <div style={{marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb'}}>
                                        <h3 style={{margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827'}}>Conversion Logs</h3>
                                        <p style={{margin: '4px 0 0', fontSize: '12px', color: '#6b7280'}}>Details for {selectedLogRow.timestamp}</p>
                                      </div>
                                      <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
                                        <div style={{borderLeft: '3px solid #0284c7', paddingLeft: '12px'}}>
                                          <div style={{fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px'}}>TIMESTAMP</div>
                                          <div style={{fontSize: '13px', fontWeight: '500', color: '#111827', marginTop: '4px'}}>{selectedLogRow.timestamp}</div>
                                        </div>
                                        <div style={{borderLeft: '3px solid #0284c7', paddingLeft: '12px'}}>
                                          <div style={{fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px'}}>CITY</div>
                                          <div style={{fontSize: '13px', fontWeight: '500', color: '#111827', marginTop: '4px'}}>{selectedLogRow.city}</div>
                                        </div>
                                        <div style={{borderLeft: '3px solid #dc2626', paddingLeft: '12px'}}>
                                          <div style={{fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px'}}>CAMPAIGN / CREATIVE ID</div>
                                          <div style={{fontSize: '13px', fontWeight: '500', color: '#111827', marginTop: '4px'}}>{selectedLogRow.campaign}</div>
                                        </div>
                                        <div style={{borderLeft: '3px solid #0284c7', paddingLeft: '12px'}}>
                                          <div style={{fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px'}}>DEVICE</div>
                                          <div style={{fontSize: '13px', fontWeight: '500', color: '#111827', marginTop: '4px'}}>{selectedLogRow.device}</div>
                                        </div>
                                        <div style={{borderLeft: '3px solid #0284c7', paddingLeft: '12px'}}>
                                          <div style={{fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px'}}>QR CODE</div>
                                          <div style={{fontSize: '13px', fontWeight: '500', color: '#111827', marginTop: '4px'}}>{selectedLogRow.qrCode}</div>
                                        </div>
                                        <div style={{borderLeft: '3px solid #0284c7', paddingLeft: '12px'}}>
                                          <div style={{fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px'}}>PUBLISHER</div>
                                          <div style={{fontSize: '13px', fontWeight: '500', color: '#111827', marginTop: '4px'}}>{selectedLogRow.publisher}</div>
                                        </div>
                                        <div style={{borderLeft: '3px solid #10b981', paddingLeft: '12px'}}>
                                          <div style={{fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px'}}>ENGAGEMENTS STATUS</div>
                                          <div style={{fontSize: '13px', fontWeight: '600', color: '#10b981', marginTop: '4px'}}>✓ {selectedLogRow.status}</div>
                                        </div>
                                        <div style={{borderLeft: '3px solid #0284c7', paddingLeft: '12px'}}>
                                          <div style={{fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px'}}>BROWSER</div>
                                          <div style={{fontSize: '13px', fontWeight: '500', color: '#111827', marginTop: '4px'}}>{selectedLogRow.browser}</div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              {activeQualityControl === 'timestamp30' && (
                                <div>
                                  <div style={{backgroundColor: '#dbeafe', padding: '12px', borderRadius: '6px', marginBottom: '16px', borderLeft: '4px solid #0284c7'}}>
                                    <strong>Date Range: Jan 28 - Feb 26, 2026 (Past 30 Days)</strong>
                                  </div>
                                  <h5>QR CODE SCANS</h5>
                                  <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '13px'}}>
                                    <thead>
                                      <tr style={{backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb'}}>
                                        <th style={{padding: '10px', textAlign: 'left', fontWeight: '600'}}>DATE</th>
                                        <th style={{padding: '10px', textAlign: 'left', fontWeight: '600'}}>TIME</th>
                                        <th style={{padding: '10px', textAlign: 'left', fontWeight: '600'}}>QR CODE SCANNED</th>
                                        <th style={{padding: '10px', textAlign: 'center', fontWeight: '600'}}>LOGS</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {qrScanDemoData.past30.map((scan, idx) => (
                                        <tr key={idx} style={{borderBottom: '1px solid #e5e7eb'}}>
                                          <td style={{padding: '10px'}}>{scan.date}</td>
                                          <td style={{padding: '10px'}}>{scan.time}</td>
                                          <td style={{padding: '10px', fontWeight: '500', color: '#0284c7'}}>{scan.qrCode}</td>
                                          <td style={{padding: '10px', textAlign: 'center'}}>
                                            <button 
                                              onClick={() => {
                                                setSelectedLogRow(selectedLogRow?.timestamp === scan.timestamp ? null : scan);
                                              }}
                                              style={{
                                                padding: '6px 16px',
                                                backgroundColor: selectedLogRow?.timestamp === scan.timestamp ? '#0369a1' : '#0284c7',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s'
                                              }}
                                              onMouseEnter={(e) => e.target.style.backgroundColor = '#0369a1'}
                                              onMouseLeave={(e) => e.target.style.backgroundColor = selectedLogRow?.timestamp === scan.timestamp ? '#0369a1' : '#0284c7'}
                                            >
                                              {selectedLogRow?.timestamp === scan.timestamp ? 'Hide' : 'View'}
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  {selectedLogRow && (
                                    <div ref={logDetailsRef} style={{marginTop: '20px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px'}}>
                                      <div style={{marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb'}}>
                                        <h3 style={{margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827'}}>Conversion Logs</h3>
                                        <p style={{margin: '4px 0 0', fontSize: '12px', color: '#6b7280'}}>Details for {selectedLogRow.timestamp}</p>
                                      </div>
                                      <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
                                        <div style={{borderLeft: '3px solid #0284c7', paddingLeft: '12px'}}>
                                          <div style={{fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px'}}>TIMESTAMP</div>
                                          <div style={{fontSize: '13px', fontWeight: '500', color: '#111827', marginTop: '4px'}}>{selectedLogRow.timestamp}</div>
                                        </div>
                                        <div style={{borderLeft: '3px solid #0284c7', paddingLeft: '12px'}}>
                                          <div style={{fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px'}}>CITY</div>
                                          <div style={{fontSize: '13px', fontWeight: '500', color: '#111827', marginTop: '4px'}}>{selectedLogRow.city}</div>
                                        </div>
                                        <div style={{borderLeft: '3px solid #dc2626', paddingLeft: '12px'}}>
                                          <div style={{fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px'}}>CAMPAIGN / CREATIVE ID</div>
                                          <div style={{fontSize: '13px', fontWeight: '500', color: '#111827', marginTop: '4px'}}>{selectedLogRow.campaign}</div>
                                        </div>
                                        <div style={{borderLeft: '3px solid #0284c7', paddingLeft: '12px'}}>
                                          <div style={{fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px'}}>DEVICE</div>
                                          <div style={{fontSize: '13px', fontWeight: '500', color: '#111827', marginTop: '4px'}}>{selectedLogRow.device}</div>
                                        </div>
                                        <div style={{borderLeft: '3px solid #0284c7', paddingLeft: '12px'}}>
                                          <div style={{fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px'}}>QR CODE</div>
                                          <div style={{fontSize: '13px', fontWeight: '500', color: '#111827', marginTop: '4px'}}>{selectedLogRow.qrCode}</div>
                                        </div>
                                        <div style={{borderLeft: '3px solid #0284c7', paddingLeft: '12px'}}>
                                          <div style={{fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px'}}>PUBLISHER</div>
                                          <div style={{fontSize: '13px', fontWeight: '500', color: '#111827', marginTop: '4px'}}>{selectedLogRow.publisher}</div>
                                        </div>
                                        <div style={{borderLeft: '3px solid #10b981', paddingLeft: '12px'}}>
                                          <div style={{fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px'}}>ENGAGEMENTS STATUS</div>
                                          <div style={{fontSize: '13px', fontWeight: '600', color: '#10b981', marginTop: '4px'}}>✓ {selectedLogRow.status}</div>
                                        </div>
                                        <div style={{borderLeft: '3px solid #0284c7', paddingLeft: '12px'}}>
                                          <div style={{fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px'}}>BROWSER</div>
                                          <div style={{fontSize: '13px', fontWeight: '500', color: '#111827', marginTop: '4px'}}>{selectedLogRow.browser}</div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              {activeQualityControl === 'uniqueIds' && (
                                <div>
                                  <div style={{backgroundColor: '#dbeafe', padding: '12px', borderRadius: '6px', marginBottom: '16px', borderLeft: '4px solid #0284c7'}}>
                                    <strong>Total Unique Conversions IDs: {qualityControlData.uniqueIds[qrTimePeriod].total}</strong>
                                  </div>
                                  <div style={{backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '6px', marginBottom: '16px'}}>
                                    <span style={{fontSize: '13px', color: '#0369a1'}}>Date Range: {qualityControlData.uniqueIds[qrTimePeriod].dateRange}</span>
                                  </div>
                                  <h5>CONVERSION ID LIST</h5>
                                  <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '12px'}}>
                                    <thead>
                                      <tr style={{backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb'}}>
                                        <th style={{padding: '8px', textAlign: 'left', fontWeight: '600'}}>CONVERSION ID</th>
                                        <th style={{padding: '8px', textAlign: 'left', fontWeight: '600'}}>DATE</th>
                                        <th style={{padding: '8px', textAlign: 'left', fontWeight: '600'}}>TIME</th>
                                        <th style={{padding: '8px', textAlign: 'left', fontWeight: '600'}}>STATUS</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {qualityControlData.uniqueIds[qrTimePeriod].ids.map((id, idx) => (
                                        <tr key={id} style={{borderBottom: '1px solid #e5e7eb'}}>
                                          <td style={{padding: '8px', color: '#dc2626', fontWeight: '500'}}>{id}</td>
                                          <td style={{padding: '8px'}}>{qrTimePeriod === 'past7' ? 'Feb 26 2026' : 'Feb 20 2026'}</td>
                                          <td style={{padding: '8px'}}>14:32:{15+idx}</td>
                                          <td style={{padding: '8px', color: '#059669', fontWeight: '500'}}>Verified</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                              {activeQualityControl === 'duplicates' && (
                                <div>
                                  <div style={{backgroundColor: '#fef3c7', padding: '12px', borderRadius: '6px', marginBottom: '16px', borderLeft: '4px solid #f59e0b'}}>
                                    <strong>Total Duplicate Scans: {qualityControlData.duplicates[qrTimePeriod].total}</strong>
                                    <p style={{fontSize: '12px', marginTop: '4px', color: '#92400e'}}>Multiple scans from same IP within 2-3 second window. Only the first scan is counted as a conversion to prevent fraudulent charges.</p>
                                  </div>
                                  <div style={{backgroundColor: '#fef3c7', padding: '8px', borderRadius: '6px', marginBottom: '16px'}}>
                                    <span style={{fontSize: '12px', color: '#b45309'}}>Date Range: {qualityControlData.duplicates[qrTimePeriod].dateRange}</span>
                                  </div>
                                  <h5>DUPLICATE SCAN GROUPS</h5>
                                  <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '12px'}}>
                                    <thead>
                                      <tr style={{backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb'}}>
                                        <th style={{padding: '8px', textAlign: 'left', fontWeight: '600'}}>DEVICE IP</th>
                                        <th style={{padding: '8px', textAlign: 'left', fontWeight: '600'}}>QR CODE</th>
                                        <th style={{padding: '8px', textAlign: 'left', fontWeight: '600'}}>FIRST SCAN</th>
                                        <th style={{padding: '8px', textAlign: 'left', fontWeight: '600'}}>DUP COUNT</th>
                                        <th style={{padding: '8px', textAlign: 'left', fontWeight: '600'}}>TIME WINDOW</th>
                                        <th style={{padding: '8px', textAlign: 'left', fontWeight: '600'}}>STATUS</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {qualityControlData.duplicates[qrTimePeriod].groups.map((item, idx) => (
                                        <tr key={idx} style={{borderBottom: '1px solid #e5e7eb'}}>
                                          <td style={{padding: '8px'}}>{item.ip}</td>
                                          <td style={{padding: '8px'}}>{item.code}</td>
                                          <td style={{padding: '8px'}}>{item.time}</td>
                                          <td style={{padding: '8px'}}>{item.count}</td>
                                          <td style={{padding: '8px'}}>{item.window}</td>
                                          <td style={{padding: '8px', backgroundColor: '#fed7aa', color: '#92400e', fontWeight: '600', borderRadius: '4px', textAlign: 'center'}}>Duplicate</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  <div style={{marginTop: '12px', padding: '10px', backgroundColor: '#eff6ff', borderRadius: '6px', fontSize: '11px', borderLeft: '3px solid #0284c7', color: '#0369a1'}}>
                                    <strong>Note:</strong> Duplicate scans are automatically detected when the same QR code is scanned multiple times from the same service IP within a 2-3 second window. Only the first scan is counted as a conversion to prevent fraudulent charges.
                                  </div>
                                </div>
                              )}
                              {activeQualityControl === 'invalidTraffic' && (
                                <div>
                                  <div style={{backgroundColor: '#fee2e2', padding: '12px', borderRadius: '6px', marginBottom: '16px', borderLeft: '4px solid #dc2626'}}>
                                    <strong>Total Invalid Traffic Detected: {qualityControlData.invalidTraffic[qrTimePeriod].total}</strong>
                                    <p style={{fontSize: '12px', marginTop: '4px', color: '#7f1d1d'}}>Invalid traffic includes bot/fraudulent activity - potential bots taking pictures without actual eye pause. These are excluded from billing.</p>
                                  </div>
                                  <div style={{backgroundColor: '#fee2e2', padding: '8px', borderRadius: '6px', marginBottom: '16px'}}>
                                    <span style={{fontSize: '12px', color: '#991b1b'}}>Date Range: {qualityControlData.invalidTraffic[qrTimePeriod].dateRange}</span>
                                  </div>
                                  <h5>SUSPICIOUS ACTIVITY LOG</h5>
                                  <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '11px'}}>
                                    <thead>
                                      <tr style={{backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb'}}>
                                        <th style={{padding: '8px', textAlign: 'left', fontWeight: '600'}}>DEVICE IP</th>
                                        <th style={{padding: '8px', textAlign: 'left', fontWeight: '600'}}>SCAN TIME</th>
                                        <th style={{padding: '8px', textAlign: 'left', fontWeight: '600'}}>ACTIVITY TYPE</th>
                                        <th style={{padding: '8px', textAlign: 'left', fontWeight: '600'}}>RISK LEVEL</th>
                                        <th style={{padding: '8px', textAlign: 'left', fontWeight: '600'}}>REASON</th>
                                        <th style={{padding: '8px', textAlign: 'left', fontWeight: '600'}}>STATUS</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {qualityControlData.invalidTraffic[qrTimePeriod].logs.map((item, idx) => (
                                        <tr key={idx} style={{borderBottom: '1px solid #e5e7eb'}}>
                                          <td style={{padding: '8px'}}>{item.ip}</td>
                                          <td style={{padding: '8px'}}>{item.time}</td>
                                          <td style={{padding: '8px', fontSize: '11px'}}>{item.type}</td>
                                          <td style={{padding: '8px', color: item.risk === 'High' ? '#dc2626' : '#ea580c', fontWeight: '600'}}>{item.risk}</td>
                                          <td style={{padding: '8px', fontSize: '10px'}}>{item.reason}</td>
                                          <td style={{padding: '8px', backgroundColor: '#fecaca', color: '#7f1d1d', fontWeight: '600', borderRadius: '4px', textAlign: 'center'}}>Invalid</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  <div style={{marginTop: '16px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px', fontSize: '12px'}}>
                                    <strong>Invalid Traffic Categories:</strong>
                                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px'}}>
                                      <div style={{textAlign: 'center', padding: '12px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb'}}>
                                        <div style={{fontSize: '24px', fontWeight: 'bold', color: '#dc2626'}}>{qualityControlData.invalidTraffic[qrTimePeriod].categories.rapidScans}</div>
                                        <div style={{fontSize: '12px', marginTop: '4px', fontWeight: '600'}}>Rapid Sequential Scans</div>
                                        <div style={{fontSize: '11px', marginTop: '4px', color: '#6b7280'}}>Multiple scans from same IP in very short timeframe (seconds)</div>
                                      </div>
                                      <div style={{textAlign: 'center', padding: '12px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb'}}>
                                        <div style={{fontSize: '24px', fontWeight: 'bold', color: '#dc2626'}}>{qualityControlData.invalidTraffic[qrTimePeriod].categories.botPattern}</div>
                                        <div style={{fontSize: '12px', marginTop: '4px', fontWeight: '600'}}>Bot Pattern Detected</div>
                                        <div style={{fontSize: '11px', marginTop: '4px', color: '#6b7280'}}>Automated scanning patterns with consistent intervals</div>
                                      </div>
                                      <div style={{textAlign: 'center', padding: '12px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb'}}>
                                        <div style={{fontSize: '24px', fontWeight: 'bold', color: '#ea580c'}}>{qualityControlData.invalidTraffic[qrTimePeriod].categories.suspiciousAgent}</div>
                                        <div style={{fontSize: '12px', marginTop: '4px', fontWeight: '600'}}>Suspicious User Agent</div>
                                        <div style={{fontSize: '11px', marginTop: '4px', color: '#6b7280'}}>Known bot or crawler user agents detected</div>
                                      </div>
                                      <div style={{textAlign: 'center', padding: '12px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb'}}>
                                        <div style={{fontSize: '24px', fontWeight: 'bold', color: '#ea580c'}}>{qualityControlData.invalidTraffic[qrTimePeriod].categories.unusualGeo}</div>
                                        <div style={{fontSize: '12px', marginTop: '4px', fontWeight: '600'}}>Unusual Geolocation</div>
                                        <div style={{fontSize: '11px', marginTop: '4px', color: '#6b7280'}}>Impossible patterns or multiple countries in short time</div>
                                      </div>
                                      <div style={{textAlign: 'center', padding: '12px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb', gridColumn: '1 / -1'}}>
                                        <div style={{fontSize: '24px', fontWeight: 'bold', color: '#ea580c'}}>{qualityControlData.invalidTraffic[qrTimePeriod].categories.proxyVpn}</div>
                                        <div style={{fontSize: '12px', marginTop: '4px', fontWeight: '600'}}>Proxy/VPN Usage</div>
                                        <div style={{fontSize: '11px', marginTop: '4px', color: '#6b7280'}}>Traffic from known proxy or VPN services</div>
                                      </div>
                                    </div>
                                    <div style={{marginTop: '12px', padding: '10px', backgroundColor: '#fef3c7', borderRadius: '6px', fontSize: '11px', borderLeft: '3px solid #f59e0b', color: '#92400e'}}>
                                      <strong>Note:</strong> Invalid traffic detection is a placeholder feature demonstrating fraud prevention capabilities. The system identifies suspicious patterns to protect advertisers from fraudulent charges. Perfect accuracy is not guaranteed at this stage, but the system will evolve with more sophisticated algorithms.
                                    </div>
                                  </div>
                                </div>
                              )}
                              {activeQualityControl === 'archive' && (
                                <div>
                                  <div style={{backgroundColor: '#dbeafe', padding: '12px', borderRadius: '6px', marginBottom: '16px', borderLeft: '4px solid #0284c7'}}>
                                    <strong>Data Older Than 30 Days</strong>
                                    <p style={{fontSize: '12px', marginTop: '4px', color: '#0369a1'}}>This section contains archived timestamps and conversion data from more than 30 days ago</p>
                                  </div>
                                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px'}}>
                                    <div style={{backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '6px', border: '1px solid #bae6fd'}}>
                                      <div style={{fontSize: '12px', fontWeight: '600', color: '#0369a1'}}>TOTAL ARCHIVED RECORDS</div>
                                      <div style={{fontSize: '20px', fontWeight: 'bold', marginTop: '8px'}}>12,847</div>
                                    </div>
                                    <div style={{backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '6px', border: '1px solid #bae6fd'}}>
                                      <div style={{fontSize: '12px', fontWeight: '600', color: '#0369a1'}}>DATE RANGE</div>
                                      <div style={{fontSize: '14px', fontWeight: '600', marginTop: '8px'}}>Dec 1 - Dec 31, 2025</div>
                                    </div>
                                    <div style={{backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '6px', border: '1px solid #bae6fd'}}>
                                      <div style={{fontSize: '12px', fontWeight: '600', color: '#0369a1'}}>STORAGE LOCATION</div>
                                      <div style={{fontSize: '14px', fontWeight: '600', marginTop: '8px'}}>Archive DB</div>
                                    </div>
                                  </div>
                                  <h5>ARCHIVED CONVERSIONS</h5>
                                  <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '12px'}}>
                                    <thead>
                                      <tr style={{backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb'}}>
                                        <th style={{padding: '8px', textAlign: 'left', fontWeight: '600'}}>DATE</th>
                                        <th style={{padding: '8px', textAlign: 'left', fontWeight: '600'}}>CONVERSIONS</th>
                                        <th style={{padding: '8px', textAlign: 'left', fontWeight: '600'}}>DUPLICATES</th>
                                        <th style={{padding: '8px', textAlign: 'left', fontWeight: '600'}}>INVALID TRAFFIC</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {[{date: 'Dec 31, 2025', conv: 342, dup: 12, invalid: 3},
                                        {date: 'Dec 30, 2025', conv: 298, dup: 8, invalid: 2},
                                        {date: 'Dec 29, 2025', conv: 315, dup: 10, invalid: 4},
                                        {date: 'Dec 28, 2025', conv: 267, dup: 6, invalid: 1},
                                        {date: 'Dec 27, 2025', conv: 289, dup: 9, invalid: 2},
                                      ].map((item, idx) => (
                                        <tr key={idx} style={{borderBottom: '1px solid #e5e7eb'}}>
                                          <td style={{padding: '8px'}}>{item.date}</td>
                                          <td style={{padding: '8px'}}>{item.conv}</td>
                                          <td style={{padding: '8px'}}>{item.dup}</td>
                                          <td style={{padding: '8px'}}>{item.invalid}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                            <button
                              className="btn-back"
                              onClick={() => {
                                setShowConversionsDetails(false);
                                setActiveQualityControl(null);
                                setSelectedLogRow(null);
                              }}
                            >
                              ← Back
                            </button>
                          </>
                        )}
                      </div>

                      <div className="detail-section audit-statement">
                        <h4>Audit Statement</h4>
                        <p>All conversions shown represent unique, consumer-initiated QR interactions verified by publisher confirmation and iPause server-side validation.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          {activeTab === 'spotlight' && (
            <div className="content-section">
              <header className="modal-header professional-modal-header">
                <div>
                  <h2>Attention Spotlight</h2>
                </div>
              </header>
              <div className="modal-body">
                {!showAttentionDetails ? (
                  <>
                    {/* Compact View */}
                    {attentionLoading ? (
                      <div style={{ textAlign: "center", padding: 40 }}>
                        <div className="spinner"></div>
                        <div style={{ marginTop: 12, color: "#6b7280" }}>Loading metrics...</div>
                      </div>
                    ) : (
                      <div className="attention-metrics-compact">
                        <div className="attention-metric-row">
                          <span className="metric-name">Attention-to-Action Rate (A2AR)</span>
                          <span className="metric-result">8.4%</span>
                        </div>
                        <div className="attention-metric-row">
                          <span className="metric-name">Attention Scan Velocity (ASV)</span>
                          <span className="metric-result">4.2 scans/min</span>
                        </div>
                        <div className="attention-metric-row">
                          <span className="metric-name">Attention Composite Index (ACI)</span>
                          <span className="metric-result">High</span>
                        </div>
                      </div>
                    )}

                    {/* Details Button */}
                    <button
                      className="btn-details"
                      onClick={() => setShowAttentionDetails(true)}
                      style={{marginTop: '20px'}}
                    >
                      Details →
                    </button>
                  </>
                ) : (
                  <>
                    {/* Detailed View */}
                    <div className="attention-details">
                      <div className="detail-section">
                        <p><strong>Date Range:</strong> Jan 1-5, 2026</p>
                      </div>

                      <div className="detail-section">
                        <p><strong>Spotlight on Attention metrics are updated in real time</strong></p>
                      </div>

                      <div className="detail-section">
                        <h4>Attention-to-Action Rate (A2AR) = Verified QR Conversions ÷ Valid Pause Opportunities</h4>
                        <div className="metric-calculation-box">
                          <div className="calc-row">
                            <span className="calc-label">Valid Pause Opportunities</span>
                            <span className="calc-value">{attentionMetrics?.a2ar?.pauseOpportunities || 0}</span>
                          </div>
                          <div className="calc-row">
                            <span className="calc-label">Verified QR Conversions</span>
                            <span className="calc-value">{attentionMetrics?.a2ar?.qrDownloads || 0}</span>
                          </div>
                          <div className="calc-row calc-result">
                            <span className="calc-label">A2AR</span>
                            <span className="calc-value">{attentionMetrics?.a2ar?.percentage?.toFixed(2) || 0}%</span>
                          </div>
                        </div>
                        <table className="tier-reference-table">
                          <thead>
                            <tr>
                              <th>Level</th>
                              <th>Description</th>
                              <th>Range</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>1</td>
                              <td>Low</td>
                              <td>0.2% - 0.4%</td>
                            </tr>
                            <tr>
                              <td>2</td>
                              <td>Fair</td>
                              <td>0.5% - 0.7%</td>
                            </tr>
                            <tr>
                              <td>3</td>
                              <td>Average</td>
                              <td>0.8% - 1.5%</td>
                            </tr>
                            <tr>
                              <td>4</td>
                              <td>Strong</td>
                              <td>1.6% - 2.5%</td>
                            </tr>
                            <tr>
                              <td>5</td>
                              <td>Exceptional</td>
                              <td>2.6% - 3.0%+</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="detail-section">
                        <h4>Attention Scan Velocity (ASV) = The Time QR Appeared and Time To Download</h4>
                        <div className="metric-calculation-box">
                          <div className="calc-row">
                            <span className="calc-label">Average Scan Time</span>
                            <span className="calc-value">{attentionMetrics?.asv?.averageSeconds?.toFixed(2) || 0}s</span>
                          </div>
                          <div className="calc-row">
                            <span className="calc-label">Tier</span>
                            <span className="calc-value">{attentionMetrics?.asv?.label || 'N/A'}</span>
                          </div>
                          <div className="calc-row calc-result">
                            <span className="calc-label">ASV Status</span>
                            <span className="calc-value">{attentionMetrics?.asv?.label || 'N/A'}</span>
                          </div>
                        </div>
                        <table className="tier-reference-table">
                          <thead>
                            <tr>
                              <th>Level</th>
                              <th>Description</th>
                              <th>Range</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>1</td>
                              <td>Low</td>
                              <td>&gt; 20 sec</td>
                            </tr>
                            <tr>
                              <td>2</td>
                              <td>Fair</td>
                              <td>15 - 20 sec</td>
                            </tr>
                            <tr>
                              <td>3</td>
                              <td>Average</td>
                              <td>10 - 15 sec</td>
                            </tr>
                            <tr>
                              <td>4</td>
                              <td>Strong</td>
                              <td>5 - 10 sec</td>
                            </tr>
                            <tr>
                              <td>5</td>
                              <td>Exceptional</td>
                              <td>&lt; 5 sec</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="detail-section">
                        <h4>Attention Composite Index (ACI) = Attention-to-Action Rate + Attention Scan Velocity</h4>
                        <div className="metric-calculation-box">
                          <div className="calc-row">
                            <span className="calc-label">A2AR Tier</span>
                            <span className="calc-value">{attentionMetrics?.a2ar?.tier || 0}</span>
                          </div>
                          <div className="calc-row">
                            <span className="calc-label">ASV Tier</span>
                            <span className="calc-value">{attentionMetrics?.asv?.tier || 0}</span>
                          </div>
                          <div className="calc-row calc-result">
                            <span className="calc-label">ACI Score</span>
                            <span className="calc-value">{attentionMetrics?.aci?.score?.toFixed(2) || 0}</span>
                          </div>
                        </div>
                        <table className="tier-reference-table">
                          <thead>
                            <tr>
                              <th>Level</th>
                              <th>Description</th>
                              <th>Range</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>1</td>
                              <td>Low</td>
                              <td>2 - 3</td>
                            </tr>
                            <tr>
                              <td>2</td>
                              <td>Fair</td>
                              <td>4 - 5</td>
                            </tr>
                            <tr>
                              <td>3</td>
                              <td>Average</td>
                              <td>6 - 7</td>
                            </tr>
                            <tr>
                              <td>4</td>
                              <td>Strong</td>
                              <td>8 - 9</td>
                            </tr>
                            <tr>
                              <td>5</td>
                              <td>Exceptional</td>
                              <td>9 - 10</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Back Button */}
                    <button
                      className="btn-back"
                      onClick={() => setShowAttentionDetails(false)}
                    >
                      ← Back
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          {activeTab === 'wallet' && (
            <div className="content-section">
              <header className="modal-header professional-modal-header">
                <div>
                  <h2>Wallet (Verified Spend)</h2>
                </div>
              </header>
              <div className="modal-body">
                {!showWalletDetails ? (
                  <>
                    {/* Wallet Summary Cards */}
                    <div className="wallet-summary">
                      <div className="wallet-card">
                        <div className="wallet-label">Wallet Balance</div>
                        <div className="wallet-amount">$18,420.00</div>
                        <div className="wallet-status">Available</div>
                      </div>
                      <div className="wallet-card">
                        <div className="wallet-label">Verified QR Conversions</div>
                        <div className="wallet-amount">2,614</div>
                        <div className="wallet-status">total</div>
                      </div>
                      <div className="wallet-card">
                        <div className="wallet-label">Average Conversion Fee</div>
                        <div className="wallet-amount">$7.04</div>
                        <div className="wallet-status">per conversion (Variable: $5.00 – $8.00)</div>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button
                      className="btn-details"
                      onClick={() => setShowWalletDetails(true)}
                      style={{marginTop: '20px'}}
                    >
                      View Details →
                    </button>
                  </>
                ) : (
                  <>
                    {/* Detailed View - Publisher Breakdown */}
                    <div className="wallet-details">
                      <h3>Verified Spend by Publisher</h3>
                      <div className="publisher-table-wrapper">
                        <table className="publisher-spend-table">
                          <thead>
                            <tr>
                              <th>Publisher</th>
                              <th>Verified QR Conversions</th>
                              <th>Avg Conversions Fee</th>
                              <th>Total Spend</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { name: 'Tubi', conversions: 1142, fee: 7.12, total: 8132.00 },
                              { name: 'Hulu', conversions: 768, fee: 6.85, total: 5260.80 },
                              { name: 'Pluto TV', conversions: 412, fee: 7.44, total: 3067.00 },
                              { name: 'Roku Channel', conversions: 292, fee: 6.93, total: 1960.00 }
                            ].map((pub) => (
                              <React.Fragment key={pub.name}>
                                <tr className="publisher-row">
                                  <td>{pub.name}</td>
                                  <td>{pub.conversions.toLocaleString()}</td>
                                  <td>${pub.fee.toFixed(2)}</td>
                                  <td className="total-spend">${pub.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                  <td>
                                    <button
                                      className="expand-btn"
                                      onClick={() => setExpandedPublisher(expandedPublisher === pub.name ? null : pub.name)}
                                    >
                                      {expandedPublisher === pub.name ? '▼' : '▶'}
                                    </button>
                                  </td>
                                </tr>
                                {expandedPublisher === pub.name && (
                                  <tr className="expanded-row">
                                    <td colSpan="5">
                                      <div className="publisher-details">
                                        <div className="detail-item">
                                          <span className="detail-label">Date Range:</span>
                                          <span className="detail-value">Jan 1–5, 2026</span>
                                        </div>
                                        <div className="detail-item">
                                          <span className="detail-label">Device Type:</span>
                                          <span className="detail-value">CTV → Mobile QR scan</span>
                                        </div>
                                        <div className="detail-item">
                                          <span className="detail-label">Content Environment:</span>
                                          <span className="detail-value">Show / Genre</span>
                                        </div>
                                        <div className="detail-item">
                                          <span className="detail-label">Conversions Status:</span>
                                          <span className="detail-value">Verified</span>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))}
                            <tr className="total-row">
                              <td><strong>Total</strong></td>
                              <td><strong>2,614</strong></td>
                              <td><strong>$7.04</strong></td>
                              <td className="total-spend"><strong>$18,420.00</strong></td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Back Button */}
                    <button
                      className="btn-back"
                      onClick={() => {
                        setShowWalletDetails(false);
                        setExpandedPublisher(null);
                      }}
                    >
                      ← Back
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Log Modal */}
      {showViewLogModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowViewLogModal(false)}
        >
          <div
            className="modal-large view-log-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <h2>
                  📺 {(selectedProgram?.series_title || selectedProgram?.qr_id || 'Program')} - Detailed Scan Logs
                </h2>
                <p>
                  Publisher: {selectedProgram?.publisher} • QR: {selectedProgram?.qr_id}
                </p>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowViewLogModal(false)}
              >
                ✕
              </button>
            </header>

            <div className="modal-body">
              {/* Per-IP Metrics Section - 3 COLUMN HORIZONTAL LAYOUT */}
              {selectedIpMetrics && (
                <div className="client-metrics-section">
                  <div className="client-metrics-header">
                    <h3>Attention Metrics for IP: {selectedIpMetrics.ip}</h3>
                    <button 
                      className="btn-close-client"
                      onClick={() => setSelectedIpMetrics(null)}
                    >
                      ✕ Close
                    </button>
                  </div>

                  {/* 3-Column Grid Layout */}
                  <div className="metrics-3col-grid">
                    {/* Column 1: A2AR */}
                    <div className="metric-column">
                      <h4 className="client-metric-title">Attention-to-Action Rate (A2AR)</h4>
                      <div className="client-metric-box">
                        <div className="client-input-row">
                          <span className="client-label">Pause Opportunities</span>
                          <span className="client-value">{selectedIpMetrics.metrics.a2ar.pauseOpportunities || 0}</span>
                        </div>
                        <div className="client-input-row">
                          <span className="client-label">Verified QR Engangements</span>
                          <span className="client-value">{selectedIpMetrics.metrics.a2ar.qrDownloads || 0}</span>
                        </div>
                        <div className="client-result-row">
                          <span className="client-metric-name">A2AR</span>
                          <span className="client-level-value">{selectedIpMetrics.metrics.a2ar.tier}</span>
                          <span className="client-result-value">{selectedIpMetrics.metrics.a2ar.percentageDisplay || selectedIpMetrics.metrics.a2ar.percentage?.toFixed(2) || '0.00'}%</span>
                        </div>
                        <div className="client-level-labels">
                          <span>Level</span>
                          <span>Result</span>
                        </div>
                      </div>
                      <table className="client-reference-table">
                        <thead>
                          <tr>
                            <th>Level</th>
                            <th>Description</th>
                            <th>Range</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className={selectedIpMetrics.metrics.a2ar.tier === 1 ? 'active' : ''}>
                            <td>1</td>
                            <td>Low</td>
                            <td>0.2% - 0.4%</td>
                          </tr>
                          <tr className={selectedIpMetrics.metrics.a2ar.tier === 2 ? 'active' : ''}>
                            <td>2</td>
                            <td>Fair</td>
                            <td>0.5% - 0.7%</td>
                          </tr>
                          <tr className={selectedIpMetrics.metrics.a2ar.tier === 3 ? 'active' : ''}>
                            <td>3</td>
                            <td>Average</td>
                            <td>0.8% - 1.5%</td>
                          </tr>
                          <tr className={selectedIpMetrics.metrics.a2ar.tier === 4 ? 'active' : ''}>
                            <td>4</td>
                            <td>Strong</td>
                            <td>1.6% - 2.5%</td>
                          </tr>
                          <tr className={selectedIpMetrics.metrics.a2ar.tier === 5 ? 'active' : ''}>
                            <td>5</td>
                            <td>Exceptional</td>
                            <td>2.6% - 3.0%+</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Column 2: ASV */}
                    <div className="metric-column">
                      <h4 className="client-metric-title">Attention Scan Velocity (ASV)</h4>
                      <div className="client-metric-box">
                        <div className="client-input-row">
                          <span className="client-label">QR Appearance</span>
                          <span className="client-value">{selectedIpMetrics.totalScans || 0}</span>
                        </div>
                        <div className="client-input-row">
                          <span className="client-label">Download Range</span>
                          <span className="client-value">{selectedIpMetrics.metrics.asv.averageSecondsDisplay || selectedIpMetrics.metrics.asv.averageSeconds?.toFixed(2) || '0.00'}s</span>
                        </div>
                        <div className="client-result-row">
                          <span className="client-metric-name">ASV</span>
                          <span className="client-level-value">{selectedIpMetrics.metrics.asv.tier}</span>
                          <span className="client-result-value">{selectedIpMetrics.metrics.asv.label}</span>
                        </div>
                        <div className="client-level-labels">
                          <span>Level</span>
                          <span>Result</span>
                        </div>
                      </div>
                      <table className="client-reference-table">
                        <thead>
                          <tr>
                            <th>Level</th>
                            <th>Description</th>
                            <th>Range</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className={selectedIpMetrics.metrics.asv.tier === 1 ? 'active' : ''}>
                            <td>1</td>
                            <td>Low</td>
                            <td>&gt; 40 sec</td>
                          </tr>
                          <tr className={selectedIpMetrics.metrics.asv.tier === 2 ? 'active' : ''}>
                            <td>2</td>
                            <td>Fair</td>
                            <td>20 - 40 sec</td>
                          </tr>
                          <tr className={selectedIpMetrics.metrics.asv.tier === 3 ? 'active' : ''}>
                            <td>3</td>
                            <td>Average</td>
                            <td>10 - 20 sec</td>
                          </tr>
                          <tr className={selectedIpMetrics.metrics.asv.tier === 4 ? 'active' : ''}>
                            <td>4</td>
                            <td>Strong</td>
                            <td>5 - 10 sec</td>
                          </tr>
                          <tr className={selectedIpMetrics.metrics.asv.tier === 5 ? 'active' : ''}>
                            <td>5</td>
                            <td>Exceptional</td>
                            <td>&lt; 5 sec</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Column 3: ACI */}
                    <div className="metric-column">
                      <h4 className="client-metric-title">Attention Composite Index (ACI)</h4>
                      <div className="client-metric-box">
                        <div className="client-input-row">
                          <span className="client-label">A2AR</span>
                          <span className="client-value">{selectedIpMetrics.metrics.a2ar.tier}</span>
                        </div>
                        <div className="client-input-row">
                          <span className="client-label">ASV</span>
                          <span className="client-value">{selectedIpMetrics.metrics.asv.tier}</span>
                        </div>
                        <div className="client-result-row">
                          <span className="client-metric-name">ACI</span>
                          <span className="client-level-value">{selectedIpMetrics.metrics.aci.level}</span>
                          <span className="client-result-value">{selectedIpMetrics.metrics.aci.scaledScore || 0}</span>
                        </div>
                        <div className="client-level-labels">
                          <span>Level</span>
                          <span>Result</span>
                        </div>
                      </div>
                      <table className="client-reference-table">
                        <thead>
                          <tr>
                            <th>Level</th>
                            <th>Description</th>
                            <th>Range</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className={selectedIpMetrics.metrics.aci.level === 1 ? 'active' : ''}>
                            <td>1</td>
                            <td>Low</td>
                            <td>2 - 3</td>
                          </tr>
                          <tr className={selectedIpMetrics.metrics.aci.level === 2 ? 'active' : ''}>
                            <td>2</td>
                            <td>Fair</td>
                            <td>4 - 5</td>
                          </tr>
                          <tr className={selectedIpMetrics.metrics.aci.level === 3 ? 'active' : ''}>
                            <td>3</td>
                            <td>Average</td>
                            <td>6 - 7</td>
                          </tr>
                          <tr className={selectedIpMetrics.metrics.aci.level === 4 ? 'active' : ''}>
                            <td>4</td>
                            <td>Strong</td>
                            <td>8 - 9</td>
                          </tr>
                          <tr className={selectedIpMetrics.metrics.aci.level === 5 ? 'active' : ''}>
                            <td>5</td>
                            <td>Exceptional</td>
                            <td>9 - 10</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {metricsLoading && (
                <div className="metrics-loading">
                  <div className="spinner"></div>
                  <p>Loading metrics...</p>
                </div>
              )}

              <table className="scans-detail-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Date</th>
                    <th>QR ID</th>
                    <th>IP Address</th>
                    <th>Device</th>
                    <th>Conversion</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {programScans.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                        No detailed scans found
                      </td>
                    </tr>
                  ) : (
                    programScans.map((scan) => (
                      <tr key={scan.id}>
                        <td>{new Date(scan.timestamp).toLocaleTimeString()}</td>
                        <td>{new Date(scan.timestamp).toLocaleDateString()}</td>
                        <td>{scan.qr_id}</td>
                        <td>{scan.ip_address}</td>
                        <td>{scan.device}</td>
                        <td>
                          {scan.conversion ? (
                            <span className="badge-success">✓ Converted</span>
                          ) : (
                            <span className="badge-neutral">No Conversion</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn-view-metrics"
                            onClick={() => handleViewIpMetrics(scan.ip_address)}
                            disabled={metricsLoading}
                          >
                            📊 View Metrics
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button
                className="btn secondary"
                onClick={() => setShowViewLogModal(false)}
              >
                Close
              </button>
              <button
                className="btn primary"
                onClick={() => exportToCSV(programScans)}
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Opportunities Modal */}
      {showPauseOpportunitiesModal && activeTab !== 'pause' && (
        <div
          className="modal-overlay"
          onClick={() => setShowPauseOpportunitiesModal(false)}
        >
          <div
            className="modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header professional-modal-header">
              <div>
                <h2>Pause Opportunities</h2>
              </div>
              <button
                className="close-btn"
                onClick={() => {
                  setShowPauseOpportunitiesModal(false);
                  setShowPauseDetails(false);
                }}
              >
                ✕
              </button>
            </header>

            <div className="modal-body pause-table-modal-body">
              {/* Date Range Inputs - Top Section */}
              <div className="date-range-header-new">
                <div className="date-inputs-wrapper">
                  <div className="date-field">
                    <label className="date-label-text">FROM</label>
                    <input 
                      type="text" 
                      value={pauseDateFrom}
                      onChange={(e) => setPauseDateFrom(e.target.value)}
                      placeholder="MM/DD/YYYY" 
                      className="date-input-new" 
                    />
                  </div>
                  <div className="date-separator-new">→</div>
                  <div className="date-field">
                    <label className="date-label-text">TO</label>
                    <input 
                      type="text" 
                      value={pauseDateTo}
                      onChange={(e) => setPauseDateTo(e.target.value)}
                      placeholder="MM/DD/YYYY" 
                      className="date-input-new" 
                    />
                  </div>
                </div>
                <div className="date-range-badge">DATE RANGE</div>
              </div>

              {/* Professional Table with Publishers on Left */}
              <div className="pause-table-container">
                <table className="pause-opportunities-table-new">
                  <thead>
                    <tr>
                      <th className="publisher-col-header">PUBLISHER</th>
                      <th className="number-col">TOTAL<br/>OPPORTUNITIES</th>
                      <th className="number-col">AVERAGE<br/>DURATION</th>
                      <th className="number-col">TOTAL QR<br/>CONVERSIONS</th>
                      <th className="number-col">CLICK THROUGH<br/>PERCENTAGE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="publisher-col-cell">
                        <div className="publisher-icon-box tubi-icon">
                          <PlayCircle size={20} />
                        </div>
                        <span className="publisher-name">Tubi</span>
                      </td>
                      <td><input type="text" className="cell-input-new" value="14,256" onChange={() => {}} /></td>
                      <td><input type="text" className="cell-input-new" value="45 sec" onChange={() => {}} /></td>
                      <td><input type="text" className="cell-input-new" value="8,934" onChange={() => {}} /></td>
                      <td><input type="text" className="cell-input-new" value="62.5%" onChange={() => {}} /></td>
                    </tr>
                    <tr>
                      <td className="publisher-col-cell">
                        <div className="publisher-icon-box hulu-icon">
                          <Tv2 size={20} />
                        </div>
                        <span className="publisher-name">Hulu</span>
                      </td>
                      <td><input type="text" className="cell-input-new" value="32,145" onChange={() => {}} /></td>
                      <td><input type="text" className="cell-input-new" value="52 sec" onChange={() => {}} /></td>
                      <td><input type="text" className="cell-input-new" value="19,234" onChange={() => {}} /></td>
                      <td><input type="text" className="cell-input-new" value="59.8%" onChange={() => {}} /></td>
                    </tr>
                    <tr>
                      <td className="publisher-col-cell">
                        <div className="publisher-icon-box youtube-icon">
                          <Youtube size={20} />
                        </div>
                        <span className="publisher-name">YouTube</span>
                      </td>
                      <td><input type="text" className="cell-input-new" value="28,934" onChange={() => {}} /></td>
                      <td><input type="text" className="cell-input-new" value="38 sec" onChange={() => {}} /></td>
                      <td><input type="text" className="cell-input-new" value="15,678" onChange={() => {}} /></td>
                      <td><input type="text" className="cell-input-new" value="54.2%" onChange={() => {}} /></td>
                    </tr>
                    <tr>
                      <td className="publisher-col-cell">
                        <div className="publisher-icon-box peacock-icon">
                          <Feather size={20} />
                        </div>
                        <span className="publisher-name">Peacock</span>
                      </td>
                      <td><input type="text" className="cell-input-new" value="19,867" onChange={() => {}} /></td>
                      <td><input type="text" className="cell-input-new" value="41 sec" onChange={() => {}} /></td>
                      <td><input type="text" className="cell-input-new" value="11,234" onChange={() => {}} /></td>
                      <td><input type="text" className="cell-input-new" value="56.3%" onChange={() => {}} /></td>
                    </tr>
                    <tr>
                      <td className="publisher-col-cell">
                        <div className="publisher-icon-box appletv-icon">
                          <Monitor size={20} />
                        </div>
                        <span className="publisher-name">Apple TV+</span>
                      </td>
                      <td><input type="text" className="cell-input-new" value="12,543" onChange={() => {}} /></td>
                      <td><input type="text" className="cell-input-new" value="35 sec" onChange={() => {}} /></td>
                      <td><input type="text" className="cell-input-new" value="7,456" onChange={() => {}} /></td>
                      <td><input type="text" className="cell-input-new" value="59.5%" onChange={() => {}} /></td>
                    </tr>
                    <tr className="total-row">
                      <td className="publisher-col-cell total-label">
                        <span className="publisher-name">TOTAL</span>
                      </td>
                      <td><input type="text" className="cell-input-new total-input" value="107,745" onChange={() => {}} /></td>
                      <td><input type="text" className="cell-input-new total-input" value="42.2 sec" onChange={() => {}} /></td>
                      <td><input type="text" className="cell-input-new total-input" value="62,536" onChange={() => {}} /></td>
                      <td><input type="text" className="cell-input-new total-input" value="58.5%" onChange={() => {}} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'none' }}>
              <button
                className="btn secondary"
                onClick={() => {
                  setShowPauseOpportunitiesModal(false);
                  setShowPauseDetails(false);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verified Conversions Modal */}
      {showVerifiedConversionsModal && activeTab !== 'conversions' && (
        <div
          className="modal-overlay"
          onClick={() => setShowVerifiedConversionsModal(false)}
        >
          <div
            className="modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <h2>VERIFIED QR CONVERSIONS</h2>
              </div>
              <button
                className="close-btn"
                onClick={() => {
                  setShowVerifiedConversionsModal(false);
                  setShowConversionsDetails(false);
                }}
              >
                ✕
              </button>
            </header>

            <div className="modal-body">
              {!showConversionsDetails ? (
                <>
                  {/* Main Stats - Compact View */}
                  <div className="pause-main-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total</span>
                      <span className="stat-number">9,486</span>
                    </div>
                    <div className="stat-divider">|</div>
                    <div className="stat-item">
                      <span className="stat-label">Today</span>
                      <span className="stat-number">214</span>
                    </div>
                    <div className="stat-divider">|</div>
                    <div className="stat-item">
                      <span className="stat-label">Last 7 Days</span>
                      <span className="stat-number">1,482</span>
                    </div>
                  </div>

                  {/* Details Button */}
                  <button
                    className="btn-details"
                    onClick={() => setShowConversionsDetails(true)}
                  >
                    Details →
                  </button>
                </>
              ) : (
                <>
                  {/* Detailed View */}
                  <div className="conversions-details">
                    <div className="detail-section">
                      <p><strong>Date Range:</strong> Jan 1–5, 2026</p>
                      <p><strong>Verified QR Conversions:</strong> 500</p>
                      <p><strong>Status:</strong> Verified • Billable • Settled</p>
                    </div>

                    <div className="detail-section">
                      <h4>Delivery Source</h4>
                      <p>CTV Pause Ads → QR Scan → Mobile Completion</p>
                    </div>

                    <div className="detail-section">
                      <h4>Publisher Distribution</h4>
                      <div className="publisher-distribution">
                        <span className="pub-item">Tubi 312</span>
                        <span className="pub-separator">/</span>
                        <span className="pub-item">Pluto TV 128</span>
                        <span className="pub-separator">/</span>
                        <span className="pub-item">Roku Channel 60</span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Creative Performance (iVPP Micro-Com)</h4>
                      <div className="creative-performance">
                        <span className="creative-item">Micro-Com #12 214</span>
                        <span className="creative-separator">|</span>
                        <span className="creative-item">Micro-Com #18 286</span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <div className="quality-controls-header">
                        <h4>Quality Controls</h4>
                        <span className="quality-meta-item">Timestamp:</span>
                        <button 
                          className="quality-meta-button"
                          onClick={() => {
                            setTimestampPeriod('past7');
                            setShowTimestampModal(true);
                          }}
                          title="Past 7 Days"
                        >
                          <Calendar size={14} />
                          <span>Past 7 Days</span>
                        </button>
                        <span className="quality-meta-separator">|</span>
                        <button 
                          className="quality-meta-button"
                          onClick={() => {
                            setTimestampPeriod('past30');
                            setShowTimestampModal(true);
                          }}
                          title="Past 30 Days"
                        >
                          <Calendar size={14} />
                          <span>Past 30 Days</span>
                        </button>
                      </div>
                      <div className="quality-controls">
                        <button 
                          className="quality-item-button"
                          onClick={() => setShowConversionIdsModal(true)}
                          title="Unique Conversions IDs"
                        >
                          <CheckCircle size={14} />
                          <span>Unique Conversions IDs</span>
                        </button>
                        <span className="quality-separator">|</span>
                        <button 
                          className="quality-item-button"
                          onClick={() => setShowDuplicatesModal(true)}
                          title="Duplicates"
                        >
                          <Copy size={14} />
                          <span>Duplicates</span>
                        </button>
                        <span className="quality-separator">|</span>
                        <button 
                          className="quality-item-button"
                          onClick={() => setShowInvalidTrafficModal(true)}
                          title="Invalid Traffic"
                        >
                          <AlertTriangle size={14} />
                          <span>Invalid Traffic</span>
                        </button>
                        <span className="quality-separator">|</span>
                        <button 
                          className="quality-item-button"
                          onClick={() => setShowArchiveModal(true)}
                          title="View Archived Data"
                        >
                          <Archive size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="detail-section audit-statement">
                      <h4>Audit Statement</h4>
                      <p>All conversions shown represent unique, consumer-initiated QR interactions verified by publisher confirmation and iPause server-side validation.</p>
                    </div>
                  </div>

                  {/* Back Button */}
                  <button
                    className="btn-back"
                    onClick={() => setShowConversionsDetails(false)}
                  >
                    ← Back
                  </button>
                </>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'none' }}>
              <button
                className="btn secondary"
                onClick={() => {
                  setShowVerifiedConversionsModal(false);
                  setShowConversionsDetails(false);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet (Verified Spend) Modal */}
      {showWalletModal && activeTab !== 'wallet' && (
        <div
          className="modal-overlay"
          onClick={() => setShowWalletModal(false)}
        >
          <div
            className="modal-large wallet-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <h2>Wallet (Verified Spend)</h2>
              </div>
              <button
                className="close-btn"
                onClick={() => {
                  setShowWalletModal(false);
                  setShowWalletDetails(false);
                  setExpandedPublisher(null);
                }}
              >
                ✕
              </button>
            </header>

            <div className="modal-body">
              {!showWalletDetails ? (
                <>
                  {/* Default Advertiser View */}
                  <div className="wallet-summary">
                    <div className="wallet-card">
                      <div className="wallet-label">Wallet Balance</div>
                      <div className="wallet-amount">$18,420.00</div>
                      <div className="wallet-status">Available</div>
                    </div>
                    <div className="wallet-card">
                      <div className="wallet-label">Verified QR Conversions</div>
                      <div className="wallet-amount">2,614</div>
                      <div className="wallet-status">total</div>
                    </div>
                    <div className="wallet-card">
                      <div className="wallet-label">Average Conversion Fee</div>
                      <div className="wallet-amount">$7.04</div>
                      <div className="wallet-status">per conversion (Variable: $5.00 – $8.00)</div>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button
                    className="btn-details"
                    onClick={() => setShowWalletDetails(true)}
                  >
                    View Details →
                  </button>
                </>
              ) : (
                <>
                  {/* Detailed View - Publisher Breakdown */}
                  <div className="wallet-details">
                    <h3>Verified Spend by Publisher</h3>
                    <div className="publisher-table-wrapper">
                      <table className="publisher-spend-table">
                        <thead>
                          <tr>
                            <th>Publisher</th>
                            <th>Verified QR Conversions</th>
                            <th>Avg Conversions Fee</th>
                            <th>Total Spend</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { name: 'Tubi', conversions: 1142, fee: 7.12, total: 8132.00 },
                            { name: 'Hulu', conversions: 768, fee: 6.85, total: 5260.80 },
                            { name: 'Pluto TV', conversions: 412, fee: 7.44, total: 3067.00 },
                            { name: 'Roku Channel', conversions: 292, fee: 6.93, total: 1960.00 }
                          ].map((pub) => (
                            <React.Fragment key={pub.name}>
                              <tr className="publisher-row">
                                <td>{pub.name}</td>
                                <td>{pub.conversions.toLocaleString()}</td>
                                <td>${pub.fee.toFixed(2)}</td>
                                <td className="total-spend">${pub.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                <td>
                                  <button
                                    className="expand-btn"
                                    onClick={() => setExpandedPublisher(expandedPublisher === pub.name ? null : pub.name)}
                                  >
                                    {expandedPublisher === pub.name ? '▼' : '▶'}
                                  </button>
                                </td>
                              </tr>
                              {expandedPublisher === pub.name && (
                                <tr className="expanded-row">
                                  <td colSpan="5">
                                    <div className="publisher-details">
                                      <div className="detail-item">
                                        <span className="detail-label">Date Range:</span>
                                        <span className="detail-value">Jan 1–5, 2026</span>
                                      </div>
                                      <div className="detail-item">
                                        <span className="detail-label">Device Type:</span>
                                        <span className="detail-value">CTV → Mobile QR scan</span>
                                      </div>
                                      <div className="detail-item">
                                        <span className="detail-label">Content Environment:</span>
                                        <span className="detail-value">Show / Genre</span>
                                      </div>
                                      <div className="detail-item">
                                        <span className="detail-label">Conversions Status:</span>
                                        <span className="detail-value">Verified</span>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                          <tr className="total-row">
                            <td><strong>Total</strong></td>
                            <td><strong>2,614</strong></td>
                            <td><strong>$7.04</strong></td>
                            <td className="total-spend"><strong>$18,420.00</strong></td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Back Button */}
                  <button
                    className="btn-back"
                    onClick={() => {
                      setShowWalletDetails(false);
                      setExpandedPublisher(null);
                    }}
                  >
                    ← Back
                  </button>
                </>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'none' }}>
              <button
                className="btn secondary"
                onClick={() => {
                  setShowWalletModal(false);
                  setShowWalletDetails(false);
                  setExpandedPublisher(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attention Spotlight Modal */}
      {showAttentionSpotlightModal && activeTab !== 'spotlight' && (
        <div
          className="modal-overlay"
          onClick={() => setShowAttentionSpotlightModal(false)}
        >
          <div
            className="modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <h2>Attention Spotlight</h2>
              </div>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAttentionSpotlightModal(false);
                  setShowAttentionDetails(false);
                }}
              >
                ✕
              </button>
            </header>

            <div className="modal-body">
              {!showAttentionDetails ? (
                <>
                  {/* Compact View */}
                  {attentionLoading ? (
                    <div style={{ textAlign: "center", padding: 40 }}>
                      <div className="spinner"></div>
                      <div style={{ marginTop: 12, color: "#6b7280" }}>Loading metrics...</div>
                    </div>
                  ) : attentionMetrics ? (
                    <div className="attention-metrics-compact">
                      <div className="attention-metric-row">
                        <span className="metric-name">Attention-to-Action Rate (A2AR)</span>
                        <span className="metric-result">{attentionMetrics.a2ar?.label || 'N/A'}</span>
                      </div>
                      <div className="attention-metric-row">
                        <span className="metric-name">Attention Scan Velocity (ASV)</span>
                        <span className="metric-result">{attentionMetrics.asv?.label || 'N/A'}</span>
                      </div>
                      <div className="attention-metric-row">
                        <span className="metric-name">Attention Composite Index (ACI)</span>
                        <span className="metric-result">{attentionMetrics.aci?.label || 'N/A'}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
                      No attention metrics available yet.
                    </div>
                  )}

                  {/* Details Button */}
                  <button
                    className="btn-details"
                    onClick={() => setShowAttentionDetails(true)}
                  >
                    Details →
                  </button>
                </>
              ) : (
                <>
                  {/* Detailed View */}
                  <div className="attention-details">
                    <div className="detail-section">
                      <p><strong>Date Range:</strong> Jan 1-5, 2026</p>
                    </div>

                    <div className="detail-section">
                      <p><strong>Spotlight on Attention metrics are updated in real time</strong></p>
                    </div>

                    <div className="detail-section">
                      <h4>Attention-to-Action Rate (A2AR) = Verified QR Conversions ÷ Valid Pause Opportunities</h4>
                      <div className="metric-calculation-box">
                        <div className="calc-row">
                          <span className="calc-label">Valid Pause Opportunities</span>
                          <span className="calc-value">{attentionMetrics?.a2ar?.pauseOpportunities || 0}</span>
                        </div>
                        <div className="calc-row">
                          <span className="calc-label">Verified QR Conversions</span>
                          <span className="calc-value">{attentionMetrics?.a2ar?.qrDownloads || 0}</span>
                        </div>
                        <div className="calc-row calc-result">
                          <span className="calc-label">A2AR</span>
                          <span className="calc-value">{attentionMetrics?.a2ar?.percentage?.toFixed(2) || 0}%</span>
                        </div>
                      </div>
                      <table className="tier-reference-table">
                        <thead>
                          <tr>
                            <th>Level</th>
                            <th>Description</th>
                            <th>Range</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>1</td>
                            <td>Low</td>
                            <td>0.2% - 0.4%</td>
                          </tr>
                          <tr>
                            <td>2</td>
                            <td>Fair</td>
                            <td>0.5% - 0.7%</td>
                          </tr>
                          <tr>
                            <td>3</td>
                            <td>Average</td>
                            <td>0.8% - 1.5%</td>
                          </tr>
                          <tr>
                            <td>4</td>
                            <td>Strong</td>
                            <td>1.6% - 2.5%</td>
                          </tr>
                          <tr>
                            <td>5</td>
                            <td>Exceptional</td>
                            <td>2.6% - 3.0%+</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="detail-section">
                      <h4>Attention Scan Velocity (ASV) = The Time QR Appeared and Time To Download</h4>
                      <div className="metric-calculation-box">
                        <div className="calc-row">
                          <span className="calc-label">Average Scan Time</span>
                          <span className="calc-value">{attentionMetrics?.asv?.averageSeconds?.toFixed(2) || 0}s</span>
                        </div>
                        <div className="calc-row">
                          <span className="calc-label">Tier</span>
                          <span className="calc-value">{attentionMetrics?.asv?.label || 'N/A'}</span>
                        </div>
                        <div className="calc-row calc-result">
                          <span className="calc-label">ASV Status</span>
                          <span className="calc-value">{attentionMetrics?.asv?.label || 'N/A'}</span>
                        </div>
                        <div className="calc-row" style={{ borderBottom: 'none', paddingTop: '8px' }}>
                          <span className="calc-label"></span>
                          <span className="calc-value" style={{ borderBottom: 'none' }}></span>
                        </div>
                      </div>
                      <table className="tier-reference-table">
                        <thead>
                          <tr>
                            <th>Level</th>
                            <th>Description</th>
                            <th>Range</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>1</td>
                            <td>Low</td>
                            <td>&gt; 20 sec</td>
                          </tr>
                          <tr>
                            <td>2</td>
                            <td>Fair</td>
                            <td>15 - 20 sec</td>
                          </tr>
                          <tr>
                            <td>3</td>
                            <td>Average</td>
                            <td>10 - 15 sec</td>
                          </tr>
                          <tr>
                            <td>4</td>
                            <td>Strong</td>
                            <td>5 - 10 sec</td>
                          </tr>
                          <tr>
                            <td>5</td>
                            <td>Exceptional</td>
                            <td>&lt; 5 sec</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="detail-section">
                      <h4>Attention Composite Index (ACI) = Attention-to-Action Rate + Attention Scan Velocity</h4>
                      <div className="metric-calculation-box">
                        <div className="calc-row">
                          <span className="calc-label">A2AR Tier</span>
                          <span className="calc-value">{attentionMetrics?.a2ar?.tier || 0}</span>
                        </div>
                        <div className="calc-row">
                          <span className="calc-label">ASV Tier</span>
                          <span className="calc-value">{attentionMetrics?.asv?.tier || 0}</span>
                        </div>
                        <div className="calc-row calc-result">
                          <span className="calc-label">ACI Score</span>
                          <span className="calc-value">{attentionMetrics?.aci?.score?.toFixed(2) || 0}</span>
                        </div>
                        <div className="calc-row" style={{ borderBottom: 'none', paddingTop: '8px' }}>
                          <span className="calc-label"></span>
                          <span className="calc-value" style={{ borderBottom: 'none' }}></span>
                        </div>
                      </div>
                      <table className="tier-reference-table">
                        <thead>
                          <tr>
                            <th>Level</th>
                            <th>Description</th>
                            <th>Range</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>1</td>
                            <td>Low</td>
                            <td>2 - 3</td>
                          </tr>
                          <tr>
                            <td>2</td>
                            <td>Fair</td>
                            <td>4 - 5</td>
                          </tr>
                          <tr>
                            <td>3</td>
                            <td>Average</td>
                            <td>6 - 7</td>
                          </tr>
                          <tr>
                            <td>4</td>
                            <td>Strong</td>
                            <td>8 - 9</td>
                          </tr>
                          <tr>
                            <td>5</td>
                            <td>Exceptional</td>
                            <td>9 - 10</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Back Button */}
                  <button
                    className="btn-back"
                    onClick={() => setShowAttentionDetails(false)}
                  >
                    ← Back
                  </button>
                </>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'none' }}>
              <button
                className="btn secondary"
                onClick={() => {
                  setShowAttentionSpotlightModal(false);
                  setShowAttentionDetails(false);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {showArchiveModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowArchiveModal(false)}
        >
          <div
            className="modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <h2><Archive size={24} style={{ display: 'inline-block', marginRight: '8px' }} /> Archived Data</h2>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowArchiveModal(false)}
              >
                ✕
              </button>
            </header>

            <div className="modal-body">
              <div className="archive-info">
                <p><strong>Data Older Than 30 Days</strong></p>
                <p className="archive-description">
                  This section contains archived timestamps and conversion data from more than 30 days ago.
                </p>
              </div>

              <div className="archive-stats">
                <div className="archive-stat-card">
                  <div className="stat-label">Total Archived Records</div>
                  <div className="stat-value">12,847</div>
                </div>
                <div className="archive-stat-card">
                  <div className="stat-label">Date Range</div>
                  <div className="stat-value">Dec 1 - Dec 31, 2025</div>
                </div>
                <div className="archive-stat-card">
                  <div className="stat-label">Storage Location</div>
                  <div className="stat-value">Archive DB</div>
                </div>
              </div>

              <div className="archive-table-section">
                <h3>Archived Conversions</h3>
                <table className="archive-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Conversions</th>
                      <th>Duplicates</th>
                      <th>Invalid Traffic</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Dec 31, 2025</td>
                      <td>342</td>
                      <td>12</td>
                      <td>3</td>
                    </tr>
                    <tr>
                      <td>Dec 30, 2025</td>
                      <td>298</td>
                      <td>8</td>
                      <td>2</td>
                    </tr>
                    <tr>
                      <td>Dec 29, 2025</td>
                      <td>315</td>
                      <td>10</td>
                      <td>4</td>
                    </tr>
                    <tr>
                      <td>Dec 28, 2025</td>
                      <td>267</td>
                      <td>6</td>
                      <td>1</td>
                    </tr>
                    <tr>
                      <td>Dec 27, 2025</td>
                      <td>289</td>
                      <td>9</td>
                      <td>2</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'none' }}>
              <button
                className="btn secondary"
                onClick={() => setShowArchiveModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invalid Traffic Modal */}
      {showInvalidTrafficModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowInvalidTrafficModal(false)}
        >
          <div
            className="modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <h2>Invalid Traffic Detection</h2>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowInvalidTrafficModal(false)}
              >
                ✕
              </button>
            </header>

            <div className="modal-body">
              <div className="invalid-traffic-info">
                <p>
                  <strong>Total Invalid Traffic Detected: 8</strong>
                </p>
                <p className="invalid-traffic-description">
                  Invalid traffic includes bot/fraudulent activity - potential bots taking pictures without actual eye pause ads or suspicious scanning patterns.
                </p>
                <p className="invalid-traffic-description">
                  Date Range: Jan 1–5, 2026
                </p>
              </div>

              <div className="invalid-traffic-table-section">
                <h3>Suspicious Activity Log</h3>
                <table className="invalid-traffic-table">
                  <thead>
                    <tr>
                      <th>Device IP</th>
                      <th>Scan Time</th>
                      <th>Activity Type</th>
                      <th>Risk Level</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>203.0.113.45</td>
                      <td>Jan 5, 14:32:15</td>
                      <td>Rapid Sequential Scans</td>
                      <td><span className="risk-high">High</span></td>
                      <td>50+ scans in 10 seconds</td>
                      <td><span className="badge-invalid">Invalid</span></td>
                    </tr>
                    <tr>
                      <td>198.51.100.78</td>
                      <td>Jan 5, 13:47:33</td>
                      <td>Bot Pattern Detected</td>
                      <td><span className="risk-high">High</span></td>
                      <td>Automated scanning pattern detected</td>
                      <td><span className="badge-invalid">Invalid</span></td>
                    </tr>
                    <tr>
                      <td>192.0.2.12</td>
                      <td>Jan 5, 12:58:47</td>
                      <td>Unusual Geolocation</td>
                      <td><span className="risk-medium">Medium</span></td>
                      <td>Multiple countries in 5 minutes</td>
                      <td><span className="badge-invalid">Invalid</span></td>
                    </tr>
                    <tr>
                      <td>203.0.113.102</td>
                      <td>Jan 4, 15:19:28</td>
                      <td>Rapid Sequential Scans</td>
                      <td><span className="risk-high">High</span></td>
                      <td>100+ scans in 30 seconds</td>
                      <td><span className="badge-invalid">Invalid</span></td>
                    </tr>
                    <tr>
                      <td>198.51.100.56</td>
                      <td>Jan 4, 14:56:03</td>
                      <td>Suspicious User Agent</td>
                      <td><span className="risk-medium">Medium</span></td>
                      <td>Known bot user agent detected</td>
                      <td><span className="badge-invalid">Invalid</span></td>
                    </tr>
                    <tr>
                      <td>192.0.2.89</td>
                      <td>Jan 4, 14:32:17</td>
                      <td>Proxy/VPN Usage</td>
                      <td><span className="risk-medium">Medium</span></td>
                      <td>Traffic from known proxy service</td>
                      <td><span className="badge-invalid">Invalid</span></td>
                    </tr>
                    <tr>
                      <td>203.0.113.34</td>
                      <td>Jan 3, 13:45:22</td>
                      <td>Bot Pattern Detected</td>
                      <td><span className="risk-high">High</span></td>
                      <td>Consistent 2-second interval scans</td>
                      <td><span className="badge-invalid">Invalid</span></td>
                    </tr>
                    <tr>
                      <td>198.51.100.67</td>
                      <td>Jan 2, 12:58:14</td>
                      <td>Rapid Sequential Scans</td>
                      <td><span className="risk-high">High</span></td>
                      <td>75+ scans in 15 seconds</td>
                      <td><span className="badge-invalid">Invalid</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="invalid-traffic-categories">
                <h3>Invalid Traffic Categories</h3>
                <div className="category-grid">
                  <div className="category-card">
                    <div className="category-title">Rapid Sequential Scans</div>
                    <div className="category-count">3</div>
                    <p>Multiple scans from same IP in very short timeframe (seconds)</p>
                  </div>
                  <div className="category-card">
                    <div className="category-title">Bot Pattern Detected</div>
                    <div className="category-count">2</div>
                    <p>Automated scanning patterns with consistent intervals</p>
                  </div>
                  <div className="category-card">
                    <div className="category-title">Suspicious User Agent</div>
                    <div className="category-count">1</div>
                    <p>Known bot or crawler user agents detected</p>
                  </div>
                  <div className="category-card">
                    <div className="category-title">Unusual Geolocation</div>
                    <div className="category-count">1</div>
                    <p>Impossible travel patterns or multiple countries</p>
                  </div>
                  <div className="category-card">
                    <div className="category-title">Proxy/VPN Usage</div>
                    <div className="category-count">1</div>
                    <p>Traffic from known proxy or VPN services</p>
                  </div>
                </div>
              </div>

              <div className="invalid-traffic-note">
                <p>
                  <strong>Note:</strong> Invalid traffic detection is a placeholder feature demonstrating fraud prevention capabilities. The system identifies suspicious patterns to protect advertisers from fraudulent charges. Perfect accuracy is not guaranteed at this stage, but the system will evolve with more sophisticated detection algorithms.
                </p>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'none' }}>
              <button
                className="btn secondary"
                onClick={() => setShowInvalidTrafficModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conversion IDs Modal */}
      {showConversionIdsModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowConversionIdsModal(false)}
        >
          <div
            className="modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <h2>Unique Conversions IDs</h2>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowConversionIdsModal(false)}
              >
                ✕
              </button>
            </header>

            <div className="modal-body">
              <div className="conversion-ids-info">
                <p>
                  <strong>Total Unique Conversions IDs: 500</strong>
                </p>
                <p className="conversion-ids-description">
                  Date Range: Jan 1–5, 2026
                </p>
              </div>

              <div className="conversion-ids-table-section">
                <h3>Conversion ID List</h3>
                <table className="conversion-ids-table">
                  <thead>
                    <tr>
                      <th>Conversion ID</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>CONV-2026-001847</td>
                      <td>Jan 5, 2026</td>
                      <td>14:32:15</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001846</td>
                      <td>Jan 5, 2026</td>
                      <td>14:28:42</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001845</td>
                      <td>Jan 5, 2026</td>
                      <td>14:15:09</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001844</td>
                      <td>Jan 5, 2026</td>
                      <td>13:47:33</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001843</td>
                      <td>Jan 5, 2026</td>
                      <td>13:22:18</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001842</td>
                      <td>Jan 5, 2026</td>
                      <td>12:58:47</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001841</td>
                      <td>Jan 5, 2026</td>
                      <td>12:34:21</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001840</td>
                      <td>Jan 5, 2026</td>
                      <td>12:11:55</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001839</td>
                      <td>Jan 5, 2026</td>
                      <td>11:47:12</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001838</td>
                      <td>Jan 5, 2026</td>
                      <td>11:23:44</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001837</td>
                      <td>Jan 4, 2026</td>
                      <td>15:19:28</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001836</td>
                      <td>Jan 4, 2026</td>
                      <td>14:56:03</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001835</td>
                      <td>Jan 4, 2026</td>
                      <td>14:32:17</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001834</td>
                      <td>Jan 4, 2026</td>
                      <td>14:08:51</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001833</td>
                      <td>Jan 4, 2026</td>
                      <td>13:45:22</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001832</td>
                      <td>Jan 4, 2026</td>
                      <td>13:21:39</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001831</td>
                      <td>Jan 4, 2026</td>
                      <td>12:58:14</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001830</td>
                      <td>Jan 4, 2026</td>
                      <td>12:34:47</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001829</td>
                      <td>Jan 4, 2026</td>
                      <td>12:11:25</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001828</td>
                      <td>Jan 4, 2026</td>
                      <td>11:47:58</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'none' }}>
              <button
                className="btn secondary"
                onClick={() => setShowConversionIdsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicates Modal */}
      {showDuplicatesModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDuplicatesModal(false)}
        >
          <div
            className="modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <h2>Duplicate QR Code Scans</h2>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowDuplicatesModal(false)}
              >
                ✕
              </button>
            </header>

            <div className="modal-body">
              <div className="duplicates-info">
                <p>
                  <strong>Total Duplicate Scans: 12</strong>
                </p>
                <p className="duplicates-description">
                  Multiple scans from the same device/camera IP within 2-3 seconds are counted as duplicates.
                </p>
                <p className="duplicates-description">
                  Date Range: Jan 1–5, 2026
                </p>
              </div>

              <div className="duplicates-table-section">
                <h3>Duplicate Scan Groups</h3>
                <table className="duplicates-table">
                  <thead>
                    <tr>
                      <th>Device IP</th>
                      <th>QR Code</th>
                      <th>First Scan</th>
                      <th>Duplicate Count</th>
                      <th>Time Window</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>192.168.1.45</td>
                      <td>testqrcode</td>
                      <td>Jan 5, 14:32:15</td>
                      <td>3</td>
                      <td>2.1 sec</td>
                      <td><span className="badge-duplicate">Duplicate</span></td>
                    </tr>
                    <tr>
                      <td>192.168.1.78</td>
                      <td>testqrcode</td>
                      <td>Jan 5, 13:47:33</td>
                      <td>2</td>
                      <td>1.8 sec</td>
                      <td><span className="badge-duplicate">Duplicate</span></td>
                    </tr>
                    <tr>
                      <td>192.168.2.12</td>
                      <td>testqrcode</td>
                      <td>Jan 5, 12:58:47</td>
                      <td>4</td>
                      <td>2.9 sec</td>
                      <td><span className="badge-duplicate">Duplicate</span></td>
                    </tr>
                    <tr>
                      <td>192.168.1.102</td>
                      <td>testqrcode</td>
                      <td>Jan 4, 15:19:28</td>
                      <td>2</td>
                      <td>1.5 sec</td>
                      <td><span className="badge-duplicate">Duplicate</span></td>
                    </tr>
                    <tr>
                      <td>192.168.3.56</td>
                      <td>testqrcode</td>
                      <td>Jan 4, 14:56:03</td>
                      <td>3</td>
                      <td>2.3 sec</td>
                      <td><span className="badge-duplicate">Duplicate</span></td>
                    </tr>
                    <tr>
                      <td>192.168.1.89</td>
                      <td>testqrcode</td>
                      <td>Jan 4, 14:32:17</td>
                      <td>2</td>
                      <td>1.9 sec</td>
                      <td><span className="badge-duplicate">Duplicate</span></td>
                    </tr>
                    <tr>
                      <td>192.168.2.34</td>
                      <td>testqrcode</td>
                      <td>Jan 4, 13:45:22</td>
                      <td>5</td>
                      <td>2.7 sec</td>
                      <td><span className="badge-duplicate">Duplicate</span></td>
                    </tr>
                    <tr>
                      <td>192.168.1.67</td>
                      <td>testqrcode</td>
                      <td>Jan 4, 12:58:14</td>
                      <td>2</td>
                      <td>1.6 sec</td>
                      <td><span className="badge-duplicate">Duplicate</span></td>
                    </tr>
                    <tr>
                      <td>192.168.3.91</td>
                      <td>testqrcode</td>
                      <td>Jan 3, 11:23:44</td>
                      <td>3</td>
                      <td>2.4 sec</td>
                      <td><span className="badge-duplicate">Duplicate</span></td>
                    </tr>
                    <tr>
                      <td>192.168.1.23</td>
                      <td>testqrcode</td>
                      <td>Jan 3, 10:15:09</td>
                      <td>2</td>
                      <td>1.7 sec</td>
                      <td><span className="badge-duplicate">Duplicate</span></td>
                    </tr>
                    <tr>
                      <td>192.168.2.55</td>
                      <td>testqrcode</td>
                      <td>Jan 2, 16:47:33</td>
                      <td>4</td>
                      <td>2.8 sec</td>
                      <td><span className="badge-duplicate">Duplicate</span></td>
                    </tr>
                    <tr>
                      <td>192.168.1.41</td>
                      <td>testqrcode</td>
                      <td>Jan 1, 09:32:15</td>
                      <td>2</td>
                      <td>1.4 sec</td>
                      <td><span className="badge-duplicate">Duplicate</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="duplicates-note">
                <p>
                  <strong>Note:</strong> Duplicate scans are automatically detected when the same QR code is scanned multiple times from the same device IP within a 2-3 second window. Only the first scan is counted as a valid conversion to prevent fraudulent charges.
                </p>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'none' }}>
              <button
                className="btn secondary"
                onClick={() => setShowDuplicatesModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conversion IDs Modal */}
      {showConversionIdsModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowConversionIdsModal(false)}
        >
          <div
            className="modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <h2>Unique Conversions IDs</h2>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowConversionIdsModal(false)}
              >
                ✕
              </button>
            </header>

            <div className="modal-body">
              <div className="conversion-ids-info">
                <p>
                  <strong>Total Unique Conversions IDs: 500</strong>
                </p>
                <p className="conversion-ids-description">
                  Date Range: Jan 1–5, 2026
                </p>
              </div>

              <div className="conversion-ids-table-section">
                <h3>Conversion ID List</h3>
                <table className="conversion-ids-table">
                  <thead>
                    <tr>
                      <th>Conversion ID</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>CONV-2026-001847</td>
                      <td>Jan 5, 2026</td>
                      <td>14:32:15</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001846</td>
                      <td>Jan 5, 2026</td>
                      <td>14:28:42</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001845</td>
                      <td>Jan 5, 2026</td>
                      <td>14:15:09</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001844</td>
                      <td>Jan 5, 2026</td>
                      <td>13:47:33</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001843</td>
                      <td>Jan 5, 2026</td>
                      <td>13:22:18</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001842</td>
                      <td>Jan 5, 2026</td>
                      <td>12:58:47</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001841</td>
                      <td>Jan 5, 2026</td>
                      <td>12:34:21</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001840</td>
                      <td>Jan 5, 2026</td>
                      <td>12:11:55</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001839</td>
                      <td>Jan 5, 2026</td>
                      <td>11:47:12</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001838</td>
                      <td>Jan 5, 2026</td>
                      <td>11:23:44</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001837</td>
                      <td>Jan 4, 2026</td>
                      <td>15:19:28</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001836</td>
                      <td>Jan 4, 2026</td>
                      <td>14:56:03</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001835</td>
                      <td>Jan 4, 2026</td>
                      <td>14:32:17</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001834</td>
                      <td>Jan 4, 2026</td>
                      <td>14:08:51</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001833</td>
                      <td>Jan 4, 2026</td>
                      <td>13:45:22</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001832</td>
                      <td>Jan 4, 2026</td>
                      <td>13:21:39</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001831</td>
                      <td>Jan 4, 2026</td>
                      <td>12:58:14</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001830</td>
                      <td>Jan 4, 2026</td>
                      <td>12:34:47</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001829</td>
                      <td>Jan 4, 2026</td>
                      <td>12:11:25</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                    <tr>
                      <td>CONV-2026-001828</td>
                      <td>Jan 4, 2026</td>
                      <td>11:47:58</td>
                      <td><span className="badge-verified">Verified</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'none' }}>
              <button
                className="btn secondary"
                onClick={() => setShowConversionIdsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timestamp Modal - Past 7 Days / Past 30 Days */}
      {showTimestampModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowTimestampModal(false)}
        >
          <div
            className="modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <h2>
                  {timestampPeriod === 'past7' ? 'Past 7 Days' : 'Past 30 Days'} - Conversions
                </h2>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowTimestampModal(false)}
              >
                ✕
              </button>
            </header>

            <div className="modal-body">
              <div className="timestamp-info">
                <p className="timestamp-description">
                  {timestampPeriod === 'past7' 
                    ? 'Date Range: Jan 1–7, 2026' 
                    : 'Date Range: Dec 2, 2025 – Jan 1, 2026'}
                </p>
              </div>

              <div className="timestamp-table-section">
                <h3>QR Code Scans</h3>
                <table className="timestamp-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>QR Code Scanned</th>
                      <th>Logs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scansLoading ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                          <div style={{ color: '#6b7280' }}>Loading scans...</div>
                        </td>
                      </tr>
                    ) : scansError ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#dc2626' }}>
                          {scansError}
                        </td>
                      </tr>
                    ) : scansData.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                          No scans found for this period
                        </td>
                      </tr>
                    ) : (
                      scansData.map((scan) => {
                        const formatted = scansApi.formatTimestamp(scan.timestamp);
                        return (
                        <tr key={scan._id}>
                          <td>{formatted.date}</td>
                          <td>{formatted.time}</td>
                          <td>{scan.qrId}</td>
                          <td>
                            <button 
                              className="logs-btn"
                              onClick={() => {
                                setSelectedLogRow(scan);
                                setShowLogsModal(true);
                              }}
                              title="View Logs"
                            >
                              📋
                            </button>
                          </td>
                        </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'none' }}>
              <button
                className="btn secondary"
                onClick={() => setShowTimestampModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}