import { useEffect, useState } from "react";
import "/src/userdashboard.css";

function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
  const fetchHistory = async () => {
    try {

      // Inside History.jsx
    const response = await fetch('http://localhost:8080/api/history', { 
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
});
      const data = await response.json();
      
      if (data.success) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error("Error fetching history from DB:", error);
    }
  };

  fetchHistory();
}, []);

   return (
    <div className="page-container">
      <h2 className="page-title">Queue History</h2>

      {history.length > 0 ? (
        history.map((item, index) => (

          <div className="card" key={item._id || index}>
            <h3>
              {new Date(item.timestamp).toLocaleString()} - {item.serviceId}
            </h3>
            
            <p><strong>Name:</strong> {item.name}</p>
            
            <p><strong>Status:</strong> {item.event}</p>
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