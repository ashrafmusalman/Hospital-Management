function Dashboard() {

  const token = localStorage.getItem("adminToken");

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial",
      }}
    >

      <h1>Admin Dashboard</h1>

      <p>
        Welcome Admin
      </p>

      <p>
        JWT Token:
      </p>

      <textarea
        rows="8"
        cols="80"
        value={token}
        readOnly
      />

    </div>
  );
}

export default Dashboard;