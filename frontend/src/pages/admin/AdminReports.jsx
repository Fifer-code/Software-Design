import { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { getAuthHeaders } from "../../utils/auth";
import { jsPDF } from "jspdf";
import "./AdminReports.css";

function AdminReports() {
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({});
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // fetch report data and services at the same time
        Promise.all([
            fetch('http://localhost:8080/api/history/report', { headers: getAuthHeaders() }).then(res => res.json()),
            fetch('http://localhost:8080/api/services', { headers: getAuthHeaders() }).then(res => res.json())
        ])
            .then(([reportData, servicesData]) => {
                setHistory(reportData.history || []);
                setServices(servicesData.services || []);

                // build a lookup map: { serviceId: statsObject } for easy access
                const statsMap = {};
                (reportData.stats || []).forEach(s => {
                    statsMap[s.serviceId] = s;
                });
                setStats(statsMap);

                setLoading(false);
            })
            .catch(err => console.error("Failed to fetch report data:", err));
    }, []);

    // derive lookups from services list: { serviceId: name } and { serviceId: category }
    const serviceNames = {};
    const serviceCategories = {};
    services.forEach(s => {
        serviceNames[s.id] = s.name;
        serviceCategories[s.id] = s.category;
    });

    const handleExportPDF = () => {
        // landscape gives enough room for 6 columns
        const doc = new jsPDF({ orientation: "landscape" });

        // title and date
        doc.setFontSize(18);
        doc.text("QueueSmart - Activity Report", 14, 20);
        doc.setFontSize(11);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

        // stats section — one line per service
        doc.setFontSize(14);
        doc.text("Queue Statistics", 14, 40);
        let y = 50;
        doc.setFontSize(10);
        services.forEach((service) => {
            const s = stats[service.id] || { joined: 0, served: 0, removed: 0, avgWaitMinutes: null };
            const avgWait = s.avgWaitMinutes !== null ? `${s.avgWaitMinutes} min` : "N/A";
            doc.text(
                `${service.name}  —  Joined: ${s.joined}  |  Served: ${s.served}  |  Removed: ${s.removed}  |  Avg Wait: ${avgWait}`,
                14, y
            );
            y += 8;
        });

        // activity log section
        y += 6;
        doc.setFontSize(14);
        doc.text("Queue Activity Log", 14, y);
        y += 10;

        // table headers — matches screen column order
        doc.setFontSize(9);
        doc.setFont(undefined, "bold");
        doc.text("Service", 14, y);
        doc.text("Queue Name", 55, y);
        doc.text("Name", 110, y);
        doc.text("Ticket ID", 155, y);
        doc.text("Event", 200, y);
        doc.text("Timestamp", 230, y);
        y += 6;

        // table rows
        doc.setFont(undefined, "normal");
        history.forEach((entry) => {
            // add new page if we run out of space
            if (y > 195) {
                doc.addPage();
                y = 20;
            }
            doc.text(serviceCategories[entry.serviceId] || entry.serviceId || "", 14, y);
            doc.text(serviceNames[entry.serviceId] || entry.serviceId || "", 55, y);
            doc.text(entry.name || "", 110, y);
            doc.text(entry.ticketId || "", 155, y);
            doc.text(entry.event || "", 200, y);
            doc.text(new Date(entry.timestamp).toLocaleString(), 230, y);
            y += 7;
        });

        doc.save("queuesmart-report.pdf");
    };

    const handleExportCSV = () => {
        const headers = ['Service', 'Queue Name', 'Name', 'Ticket ID', 'Event', 'Timestamp'];
        const rows = history.map(e => [
            serviceCategories[e.serviceId] || e.serviceId,
            serviceNames[e.serviceId] || e.serviceId,
            e.name,
            e.ticketId,
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
                    <div className="export-buttons">
                        <button className="action-btn export-btn" onClick={handleExportPDF}>Export PDF</button>
                        <button className="action-btn export-btn" onClick={handleExportCSV}>Export CSV</button>
                    </div>
                </div>

                <div className="reports-tables-container">
                    <div className="reports-table-card reports-summary-card">
                        <div className="reports-card-header">
                            <h3>Queue Summary</h3>
                        </div>
                        <div className="reports-card-body">
                            <table className="reports-table reports-summary-table">
                                <thead>
                                    <tr>
                                        <th>Queue</th>
                                        <th>Joined</th>
                                        <th>Served</th>
                                        <th>Removed</th>
                                        <th>Avg Wait</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.map((service) => {
                                        const s = stats[service.id] || { joined: 0, served: 0, removed: 0, avgWaitMinutes: null };
                                        return (
                                            <tr key={service.id}>
                                                <td>
                                                    <div className="reports-queue-name">{service.name}</div>
                                                    <div className="reports-queue-category">{service.category || "Uncategorized"}</div>
                                                </td>
                                                <td>{s.joined}</td>
                                                <td>{s.served}</td>
                                                <td>{s.removed}</td>
                                                <td>{s.avgWaitMinutes !== null ? `${s.avgWaitMinutes} min` : "N/A"}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="reports-table-card reports-activity-card">
                        <div className="reports-card-header">
                            <h3>Queue Activity Log</h3>
                        </div>
                        <div className="reports-card-body">
                            {history.length === 0 ? (
                                <p>No history recorded yet.</p>
                            ) : (
                                <table className="reports-table">
                                    <thead>
                                        <tr>
                                            <th>Service</th>
                                            <th>Queue Name</th>
                                            <th>Name</th>
                                            <th>Ticket ID</th>
                                            <th>Event</th>
                                            <th>Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((entry, i) => (
                                            <tr key={i}>
                                                <td>{serviceCategories[entry.serviceId] || entry.serviceId}</td>
                                                <td>{serviceNames[entry.serviceId] || entry.serviceId}</td>
                                                <td>{entry.name}</td>
                                                <td>{entry.ticketId}</td>
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
            </div>
        </div>
    );
}

export default AdminReports;
