import "/src/userdashboard.css";

function QueueStatus() {
  return (
    <div className="page-container">
      <h2 className="page-title">Queue Status</h2>

      <div className="card">
        <h3>DMV Queue</h3>
        <p>Position: 5</p>
        <p>Estimated Wait: 15 minutes</p>
        <p>Status: Waiting</p>
        <button className="secondary-btn">Leave Queue</button>
      </div>
    </div>
  );
}

export default QueueStatus;
