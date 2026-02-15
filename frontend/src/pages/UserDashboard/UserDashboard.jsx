import "/src/userdashboard.css";

function UserDashboard() {
  return (
    <div className="page-container">
      <h2 className="page-title">User Dashboard</h2>

      <div className="card-grid">
        <div className="card">
          <h3>Current Queue</h3>
          <p>You are not currently in a queue.</p>
          <button className="secondary-btn">Join Queue</button>
        </div>

        <div className="card">
          <h3>Active Services</h3>
          <p>DMV</p>
          <p>Banking</p>
          <p>Student Advising</p>
        </div>

        <div className="card">
          <h3>Notifications</h3>
          <p>No new updates.</p>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
