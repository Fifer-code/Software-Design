import "/src/userdashboard.css";

function History() {
  return (
    <div className="page-container">
      <h2 className="page-title">Queue History</h2>

      <div className="card">
        <h3>Feb 2 - DMV</h3>
        <p>Status: Served</p>
      </div>

      <div className="card">
        <h3>Feb 15 - Banking</h3>
        <p>Status: Left Queue</p>
      </div>
    </div>
  );
}

export default History;
