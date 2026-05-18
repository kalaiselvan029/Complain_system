const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Home@home1",
    database: "complaint_db"
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected");
});

module.exports = db;