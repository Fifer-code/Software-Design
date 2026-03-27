import { useEffect, useState } from "react";
import "/src/userdashboard.css";

function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("queueHistory") || "[]");
    setHistory(stored);
  }, []);

  return (
    <div className="page-container">
      <h2 className="page-title">Queue History</h2>

      {history.length > 0 ? (
        history.map((item, index) => (
          <div className="card" key={index}>
            <h3>{item.date} - {item.service}</h3>
            <p>Status: {item.status}</p>
          </div>
        ))
      ) : (
        <div className="card">
          <p>No history available.</p>
        </div>
      )}
    </div>
  );
}

export default History;