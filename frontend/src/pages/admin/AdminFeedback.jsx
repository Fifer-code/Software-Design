import { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { getAuthHeaders } from "../../utils/auth";
import "./AdminFeedback.css";

function AdminFeedback() {
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(true);

    // fetch all feedback from backend on load
    useEffect(() => {
        fetch('http://localhost:8080/api/feedback', {
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(data => {
                setFeedbackList(data);
                setLoading(false);
            })
            .catch(err => console.error("Failed to fetch feedback:", err));
    }, []);

    // calculate average rating from all submissions
    const getAverageRating = () => {
        if (feedbackList.length === 0) return "N/A";
        const total = feedbackList.reduce((sum, f) => sum + f.rating, 0);
        return (total / feedbackList.length).toFixed(1);
    };

    if (loading) {
        return (
            <div className="admin-layout">
                <AdminSidebar />
                <div className="admin-shell"><h2>Loading feedback...</h2></div>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-shell">
                <h2>Feedback</h2>

                {/* summary stats row */}
                <div className="feedback-stats-row">
                    <div className="feedback-stat-card">
                        <h3>Total Submissions</h3>
                        <p className="feedback-stat-number">{feedbackList.length}</p>
                    </div>
                    <div className="feedback-stat-card">
                        <h3>Average Rating</h3>
                        <p className="feedback-stat-number">{getAverageRating()} / 5</p>
                    </div>
                </div>

                {/* feedback table */}
                <div className="feedback-table-card">
                    <h3>All Submissions</h3>
                    {feedbackList.length === 0 ? (
                        <p>No feedback submitted yet.</p>
                    ) : (
                        <table className="feedback-table">
                            <thead>
                                <tr>
                                    <th>Rating</th>
                                    <th>Comment</th>
                                    <th>Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feedbackList.map((entry) => (
                                    <tr key={entry._id}>
                                        <td className={`rating-${entry.rating}`}>{entry.rating} / 5</td>
                                        <td>{entry.comment || "—"}</td>
                                        <td>{new Date(entry.createdAt).toLocaleString()}</td>
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

export default AdminFeedback;
