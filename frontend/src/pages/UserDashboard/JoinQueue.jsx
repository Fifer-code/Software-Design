import "/src/userdashboard.css";

function JoinQueue() {
  return (
    <div className="page-container">
      <h2 className="page-title">Join a Queue</h2>

      <div className="card-grid">
        <div className="card">
          <h3>DMV</h3>
          <p>Estimated Wait: 25 minutes</p>
          <button className="secondary-btn">Join</button>
        </div>

        <div className="card">
          <h3>Banking Services</h3>
          <p>Estimated Wait: 10 minutes</p>
          <button className="secondary-btn">Join</button>
        </div>

        <div className="card">
          <h3>Student Advising</h3>
          <p>Estimated Wait: 40 minutes</p>
          <button className="secondary-btn">Join</button>
        </div>
      </div>
    </div>
  );
}

export default JoinQueue;
