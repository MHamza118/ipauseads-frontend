// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

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
                    <th>Thumbnail</th>
                    <th>Publisher</th>
                    <th>Program</th>
                    <th>QR Code ID</th>
                    <th>Verified Conversions</th>
                    <th>Last Scan Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {spotlightData.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
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
                        <td>
                          <span className="publisher-badge">{program.publisher}</span>
                        </td>
                        <td>
                          <strong>{program.series_title}</strong>
                        </td>
                        <td>
                          <span className="qr-badge">{program.qr_id}</span>
                        </td>
                        <td className="conversion-count">
                          {program.verified_conversions}
                        </td>
                        <td>
                          {program.last_scan_time ? new Date(program.last_scan_time).toLocaleString() : 'N/A'}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-view-log"
                              onClick={() => handleViewLog(program)}
                            >
                              📋 View Log
                            </button>
                          </div>
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
    </div>
  );
}
