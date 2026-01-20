// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Archive } from "lucide-react";

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
  const [showPauseDetails, setShowPauseDetails] = useState(false);
  const [showVerifiedConversionsModal, setShowVerifiedConversionsModal] = useState(false);
  const [showConversionsDetails, setShowConversionsDetails] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [expandedPublisher, setExpandedPublisher] = useState(null);
  const [showAttentionSpotlightModal, setShowAttentionSpotlightModal] = useState(false);
  const [showAttentionDetails, setShowAttentionDetails] = useState(false);

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

  useEffect(() => {
    fetchSummary();
    fetchSpotlightData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.from, filters.to, filters.deviceType, filters.conversionStatus, filters.ip, filters.qrId]);

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
          <label className="filter-label">Conversion Status</label>
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
        <header className="dashboard-header">
          <div>
            <h1>📺 Spotlight - Performance by Program</h1>
            <p className="subtitle">
              View conversions aggregated by TV shows and content
            </p>
          </div>
          <button onClick={fetchSpotlightData} className="btn secondary">
            ↻ Refresh
          </button>
        </header>

        {/* KPI Cards */}
        <div className="kpi-cards">
          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: "#14b8a6" }}>
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Total Register</div>
              <div className="kpi-value">
                {(summary.registered ?? 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: "#06b6d4" }}>
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Total Conversions</div>
              <div className="kpi-value">
                {(summary.conversions ?? 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: "#8b5cf6" }}>
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Conversion Rate</div>
              <div className="kpi-value">{summary.conversionRate}%</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: "#ec4899" }}>
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Unique IPs</div>
              <div className="kpi-value">
                {(summary.uniqueIps ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Spotlight - aggregated by program */}
        <div className="spotlight-section">
          <div className="table-header">
            <div>
              <strong>Content Performance</strong>
            </div>
            <button className="btn" onClick={fetchSpotlightData}>
              ↻ Refresh
            </button>
          </div>

          <div className="table-wrap">
            {loading ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div className="spinner"></div>
                <div style={{ marginTop: 12, color: "#6b7280" }}>Loading...</div>
              </div>
            ) : (
              <table className="spotlight-table">
                <thead>
                  <tr>
                    <th>
                      <button 
                        className="header-button"
                        onClick={() => setShowPauseOpportunitiesModal(true)}
                      >
                        Pause Opportunities
                      </button>
                    </th>
                    <th>
                      <button 
                        className="header-button"
                        onClick={() => setShowVerifiedConversionsModal(true)}
                      >
                        Verified Conversions
                      </button>
                    </th>
                    <th>
                      <button 
                        className="header-button"
                        onClick={() => setShowAttentionSpotlightModal(true)}
                      >
                        Attention Spotlight
                      </button>
                    </th>
                    <th>
                      <button 
                        className="header-button"
                        onClick={() => setShowWalletModal(true)}
                      >
                        Wallet (Verified Spend)
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {spotlightData.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", padding: "40px" }}>
                        <p>No program data available yet.</p>
                        <p style={{ fontSize: "14px", color: "#666" }}>
                          Scans will be grouped by TV show/content here.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    spotlightData.map((program, index) => (
                      <tr key={index}>
                        <td>
                          <div className="program-thumbnail">
                            {program.thumbnail_url ? (
                              <img
                                src={program.thumbnail_url}
                                alt={program.series_title}
                              />
                            ) : (
                              <div className="placeholder-thumb">📺</div>
                            )}
                          </div>
                        </td>
                        <td className="conversion-count">
                          {program.verified_conversions}
                        </td>
                        <td>
                          <strong>{program.series_title}</strong>
                          <div className="program-meta">
                            <span className="publisher-badge">{program.publisher}</span>
                            <span className="qr-badge">{program.qr_id}</span>
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn-view-log"
                            onClick={() => handleViewLog(program)}
                          >
                            📋 View Log
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>


        {/* Charts */}
        <div className="charts">
          <div className="chart card">
            <div className="card-title">Visits (last 7 days)</div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visits}>
                  <XAxis dataKey="date" style={{ fontSize: 12 }} />
                  <YAxis style={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8
                    }}
                    labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                  />
                  <Line
                    dataKey="count"
                    stroke="#14b8a6"
                    strokeWidth={3}
                    dot={{ fill: "#14b8a6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart card">
            <div className="card-title">Device Breakdown</div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deviceData}>
                  <XAxis dataKey="name" style={{ fontSize: 12 }} />
                  <YAxis style={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8
                    }}
                    labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                    formatter={(value, name, props) => [
                      `${value} (${props.payload.percentage}%)`,
                      "Count"
                    ]}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {deviceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
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
                          <span className="client-label">Verified QR Conversions</span>
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
      {showPauseOpportunitiesModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowPauseOpportunitiesModal(false)}
        >
          <div
            className="modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header">
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

            <div className="modal-body">
              {!showPauseDetails ? (
                <>
                  {/* Main Stats - Compact View */}
                  <div className="pause-main-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total</span>
                      <span className="stat-number">128,742</span>
                    </div>
                    <div className="stat-divider">|</div>
                    <div className="stat-item">
                      <span className="stat-label">Today</span>
                      <span className="stat-number">3,214</span>
                    </div>
                    <div className="stat-divider">|</div>
                    <div className="stat-item">
                      <span className="stat-label">Last 7 Days</span>
                      <span className="stat-number">21,884</span>
                    </div>
                    <div className="stat-divider">|</div>
                    <div className="stat-item">
                      <span className="stat-label">Active Publishers</span>
                      <span className="stat-number">6</span>
                    </div>
                  </div>

                  {/* Details Button */}
                  <button
                    className="btn-details"
                    onClick={() => setShowPauseDetails(true)}
                  >
                    Details →
                  </button>
                </>
              ) : (
                <>
                  {/* Detailed View */}
                  <div className="pause-description">
                    <p>
                      <strong>Counting Criteria:</strong> Only pause events where the video reached 100% completion 
                      and the QR code was rendered and viewable are counted.
                    </p>
                    <p><strong>Data Range:</strong> Jan 1–5, 2026</p>
                  </div>

                  {/* Publisher Distribution */}
                  <div className="pause-section">
                    <h3>Publisher Distribution</h3>
                    <div className="publisher-distribution">
                      <span className="pub-item">Tubi 312</span>
                      <span className="pub-separator">/</span>
                      <span className="pub-item">Pluto TV 128</span>
                      <span className="pub-separator">/</span>
                      <span className="pub-item">Roku Channel 60</span>
                    </div>
                  </div>

                  {/* Back Button */}
                  <button
                    className="btn-back"
                    onClick={() => setShowPauseDetails(false)}
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
      {showVerifiedConversionsModal && (
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
                <h2>Verified Conversions</h2>
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
                    <div className="stat-divider">|</div>
                    <div className="stat-item">
                      <span className="stat-label">Conversion Rate</span>
                      <span className="stat-number">7.37%</span>
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
                      <p><strong>Verified Conversions:</strong> 500</p>
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
                        <span className="quality-meta-item">Timestamp: Past 7 Days: 1,482</span>
                        <span className="quality-meta-separator">|</span>
                        <span className="quality-meta-item">Past 30 Days: 4,156</span>
                      </div>
                      <div className="quality-controls">
                        <span className="quality-item">Unique Conversion IDs 500</span>
                        <span className="quality-separator">|</span>
                        <span className="quality-item">Duplicates 0</span>
                        <span className="quality-separator">|</span>
                        <span className="quality-item-with-icon">
                          <span>Invalid Traffic 0</span>
                          <button 
                            className="archive-btn"
                            onClick={() => setShowArchiveModal(true)}
                            title="View Archived Data"
                          >
                            <Archive size={18} />
                          </button>
                        </span>
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
      {showWalletModal && (
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
                      <div className="wallet-label">Verified Conversions</div>
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
                            <th>Verified Conversions</th>
                            <th>Avg Conversion Fee</th>
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
                                        <span className="detail-label">Conversion Status:</span>
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
      {showAttentionSpotlightModal && (
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
                  <div className="attention-metrics-compact">
                    <div className="attention-metric-row">
                      <span className="metric-name">Attention-to-Action Rate (A2AR)</span>
                      <span className="metric-result">Exceptional</span>
                    </div>
                    <div className="attention-metric-row">
                      <span className="metric-name">Attention Scan Velocity (ASV)</span>
                      <span className="metric-result">Strong</span>
                    </div>
                    <div className="attention-metric-row">
                      <span className="metric-name">Attention Composite Index (ACI)</span>
                      <span className="metric-result">Exceptional</span>
                    </div>
                  </div>

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
                          <span className="calc-value">_______</span>
                        </div>
                        <div className="calc-row">
                          <span className="calc-label">Verified QR Conversions</span>
                          <span className="calc-value">_______</span>
                        </div>
                        <div className="calc-row calc-result">
                          <span className="calc-label">A2AR</span>
                          <span className="calc-value">_______</span>
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
                          <span className="calc-label">QR Appearance</span>
                          <span className="calc-value">_______</span>
                        </div>
                        <div className="calc-row">
                          <span className="calc-label">Download Range</span>
                          <span className="calc-value">_______</span>
                        </div>
                        <div className="calc-row calc-result">
                          <span className="calc-label">ASV</span>
                          <span className="calc-value">_______</span>
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
                          <span className="calc-label">A2AR</span>
                          <span className="calc-value">_______</span>
                        </div>
                        <div className="calc-row">
                          <span className="calc-label">ASV</span>
                          <span className="calc-value">_______</span>
                        </div>
                        <div className="calc-row calc-result">
                          <span className="calc-label">ACI</span>
                          <span className="calc-value">_______</span>
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
    </div>
  );
}
