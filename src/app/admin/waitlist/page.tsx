"use client";

import { useEffect, useState } from "react";
import "./styles.css";

type WaitlistEntry = {
  id: string;
  email: string;
  audit_id: string;
  unlock_id: string;
  page_type?: string | null;
  created_at: string;
};

type Stats = {
  total: number;
  today: number;
  uniqueEmails: number;
};

export default function AdminWaitlistDashboard() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, today: 0, uniqueEmails: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      // Fetch entries
      const entriesResponse = await fetch(
        `/api/admin/waitlist?limit=${ITEMS_PER_PAGE}&offset=${(currentPage - 1) * ITEMS_PER_PAGE}`
      );
      const entriesData = await entriesResponse.json();

      if (entriesData.status === "success") {
        setEntries(entriesData.data.entries);
        setTotalEntries(entriesData.data.total);
      }

      // Fetch stats
      const statsResponse = await fetch("/api/admin/waitlist?action=stats");
      const statsData = await statsResponse.json();

      if (statsData.status === "success") {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEntries = entries.filter((entry) =>
    entry.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const csv = [
      ["ID", "Email", "Unlock ID", "Page Type", "Audit ID", "Registered At"],
      ...filteredEntries.map((entry) => [
        entry.id,
        entry.email,
        entry.unlock_id,
        entry.page_type || "N/A",
        entry.audit_id,
        new Date(entry.created_at).toLocaleString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uxray-waitlist-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const totalPages = Math.ceil(totalEntries / ITEMS_PER_PAGE);

  if (isLoading && currentPage === 1) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading waitlist data...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div>
          <h1>UXRay Waitlist Dashboard</h1>
          <p className="subtitle">Manage early access signups</p>
        </div>
        <div className="header-actions">
          <button onClick={fetchData} className="btn-refresh" disabled={isLoading}>
            {isLoading ? "Refreshing..." : "🔄 Refresh"}
          </button>
          <button onClick={exportToCSV} className="btn-export">
            📥 Export CSV
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Signups</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.uniqueEmails}</div>
          <div className="stat-label">Unique Emails</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.today}</div>
          <div className="stat-label">Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {stats.total > 0 ? ((stats.today / stats.total) * 100).toFixed(1) : 0}%
          </div>
          <div className="stat-label">Growth Rate</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="waitlist-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Unlock ID</th>
              <th>Page Type</th>
              <th>Audit ID</th>
              <th>Registered At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  {searchTerm ? "No entries match your search" : "No entries yet"}
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <code className="id-code">{entry.id.slice(0, 8)}...</code>
                  </td>
                  <td className="email-cell">{entry.email}</td>
                  <td>
                    <code className="unlock-code">{entry.unlock_id.slice(0, 8)}...</code>
                  </td>
                  <td>
                    <span className="page-type-badge">{entry.page_type || "N/A"}</span>
                  </td>
                  <td>
                    <code className="audit-id">{entry.audit_id.slice(0, 8)}...</code>
                  </td>
                  <td className="date-cell">
                    {new Date(entry.created_at).toLocaleString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>
                    <button
                      onClick={() => copyToClipboard(entry.email)}
                      className="copy-btn"
                      title="Copy email"
                    >
                      Copy
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
            className="pagination-btn"
          >
            ← Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages} ({totalEntries} total entries)
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages || isLoading}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
