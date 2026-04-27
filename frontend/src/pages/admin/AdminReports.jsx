import { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { getAuthHeaders } from "../../utils/auth";
import "./AdminReports.css";

function AdminReports() {
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8080/api/history/report', {
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(data => {
                setHistory(data.history || []);
                setStats(data.stats || []);
                setLoading(false);
            })
            .catch(err => console.error("Failed to fetch report data:", err));
    }, []);

    const handleExportCSV = () => {
        const headers = ['Ticket ID', 'Name', 'Service', 'Event', 'Timestamp'];
        const rows = history.map(e => [
            e.ticketId,
            e.name,
            e.serviceId,
            e.event,
            new Date(e.timestamp).toLocaleString()
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'queuesmart-report.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="admin-layout">
                <AdminSidebar />
                <div className="admin-shell"><h2>Loading report...</h2></div>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-shell">
                <div className="reports-header">
                    <h2>Reports</h2>
                    <button className="action-btn export-btn" onClick={handleExportCSV}>Export CSV</button>
                </div>

                <div className="reports-stats-row">
                    {stats.map((s) => (
                        <div key={s.serviceId} className="report-stat-card">
                            <h3>{s.serviceId}</h3>
                            <p>Joined: <span>{s.joined}</span></p>
                            <p>Served: <span>{s.served}</span></p>
                            <p>Removed: <span>{s.removed}</span></p>
                            <p>Avg Wait: <span>{s.avgWaitMinutes !== null ? `${s.avgWaitMinutes} min` : 'N/A'}</span></p>
                        </div>
                    ))}
                </div>

                <div className="reports-table-card">
                    <h3>Queue Activity Log</h3>
                    {history.length === 0 ? (
                        <p>No history recorded yet.</p>
                    ) : (
                        <table className="reports-table">
                            <thead>
                                <tr>
                                    <th>Ticket ID</th>
                                    <th>Name</th>
                                    <th>Service</th>
                                    <th>Event</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((entry, i) => (
                                    <tr key={i}>
                                        <td>{entry.ticketId}</td>
                                        <td>{entry.name}</td>
                                        <td>{entry.serviceId}</td>
                                        <td className={`event-${entry.event}`}>{entry.event}</td>
                                        <td>{new Date(entry.timestamp).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminReports;
