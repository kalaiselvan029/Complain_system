const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Home@home1",
  database: "complaint_db"
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    process.exit(1); // Exit if no DB connection
  } else {
    console.log("MySQL Connected");
  }
});

// Route to add a complaint
app.post("/add-complaint", (req, res) => {
  const { name, email, complaint } = req.body;

  if (!name || !email || !complaint) {
    return res.status(400).send("Please provide name, email, and complaint.");
  }

  const query = "INSERT INTO complaints (name, email, complaint) VALUES (?, ?, ?)";
  db.query(query, [name, email, complaint], (err) => {
    if (err) {
      console.error("Error inserting complaint:", err);
      return res.status(500).send("Database error");
    }
    res.redirect("/");
  });
});

// Route to get all complaints
app.get("/complaints", (req, res) => {
  db.query("SELECT * FROM complaints", (err, results) => {
    if (err) {
      console.error("Error fetching complaints:", err);
      return res.status(500).send("Database error");
    }

    if (!results || results.length === 0) {
      return res.send("<h2>No complaints found.</h2>");
    }

    let html = "<h2>All Complaints</h2><table border='1'><tr><th>ID</th><th>Name</th><th>Email</th><th>Complaint</th></tr>";
    results.forEach(row => {
      html += `<tr><td>${row.id}</td><td>${row.name}</td><td>${row.email}</td><td>${row.complaint}</td></tr>`;
    });
    html += "</table>";

    res.send(html);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});