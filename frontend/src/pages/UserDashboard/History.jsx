import { useEffect, useState } from "react";
import "/src/userdashboard.css";

function History() {
  const [history, setHistory] = useState([]);
  const [serviceNames, setServiceNames] = useState({});

  useEffect(() => {
  const fetchHistory = async () => {
    try {

    const response = await fetch('http://localhost:8080/api/history?limit=20', {
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

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/services', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      if (data.services) {
        const nameMap = {};
        data.services.forEach(service => {
          nameMap[service.id] = service.name;
        });
        setServiceNames(nameMap);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  fetchHistory();
  fetchServices();
}, []);

   return (
    <div className="page-container">
      <h2 className="page-title">Queue History</h2>

      {history.length > 0 ? (
        history.map((item, index) => (

          <div className="card" key={item._id || index}>
            <h3>
              {new Date(item.timestamp).toLocaleString()} - {serviceNames[item.serviceId] || item.serviceId}
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