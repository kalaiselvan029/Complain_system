const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("public"));

/* =========================
   MYSQL CONNECTION
========================= */

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Home@home1",
    database: "complaint_db"
});

db.connect((err) => {

    if (err) {

        console.log("Database Connection Failed");
        console.log(err);

    } else {

        console.log("MySQL Connected Successfully");

    }

});

/* =========================
   HOME PAGE
========================= */

app.get("/", (req, res) => {

    const totalQuery =
        "SELECT COUNT(*) AS total FROM complaints";

    const pendingQuery = `
        SELECT COUNT(*) AS pending
        FROM complaints
        WHERE status='Pending'
    `;

    const resolvedQuery = `
        SELECT COUNT(*) AS resolved
        FROM complaints
        WHERE status='Resolved'
    `;

    db.query(totalQuery, (err, totalResult) => {

        if (err) {
            return res.send("Database Error");
        }

        db.query(pendingQuery, (err, pendingResult) => {

            if (err) {
                return res.send("Database Error");
            }

            db.query(resolvedQuery, (err, resolvedResult) => {

                if (err) {
                    return res.send("Database Error");
                }

                const total =
                    totalResult[0].total;

                const pending =
                    pendingResult[0].pending;

                const resolved =
                    resolvedResult[0].resolved;

                res.send(`

                <html>

                <head>

                <title>
                    Complaint Management System
                </title>

                <link
                    rel="stylesheet"
                    href="style.css"
                >

                </head>

                <body>

                <div class="navbar">

                    <h1>
                        Complaint Management System
                    </h1>

                </div>

                <div class="dashboard">

                    <div class="card">

                        <h3>
                            Total Complaints
                        </h3>

                        <p>${total}</p>

                    </div>

                    <div class="card">

                        <h3>
                            Pending
                        </h3>

                        <p>${pending}</p>

                    </div>

                    <div class="card">

                        <h3>
                            Resolved
                        </h3>

                        <p>${resolved}</p>

                    </div>

                </div>

                <div class="container">

                    <a href="add_complaint.html">

                        <button>
                            Register Complaint
                        </button>

                    </a>

                    <a href="/complaints">

                        <button>
                            View Complaints
                        </button>

                    </a>

                </div>

                </body>

                </html>

                `);

            });

        });

    });

});

/* =========================
   ADD COMPLAINT
========================= */

app.post("/add-complaint", (req, res) => {

    const {
        name,
        email,
        category,
        priority,
        complaint
    } = req.body;

    if (
        !name ||
        !email ||
        !category ||
        !priority ||
        !complaint
    ) {

        return res.send(
            "All fields are required"
        );

    }

    const sql = `
        INSERT INTO complaints
        (
            name,
            email,
            category,
            priority,
            complaint,
            status
        )
        VALUES(?,?,?,?,?,?)
    `;

    db.query(
        sql,
        [
            name,
            email,
            category,
            priority,
            complaint,
            "Pending"
        ],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.send(
                    "Database Error"
                );

            }

            res.send(`

            <html>

            <head>

            <style>

            body{
                font-family:Arial;
                background:#f1f5f9;
                text-align:center;
                margin-top:100px;
            }

            button{
                background:#2563eb;
                color:white;
                border:none;
                padding:12px 20px;
                border-radius:8px;
                cursor:pointer;
            }

            </style>

            </head>

            <body>

            <h2 style="color:green;">
                Complaint Registered Successfully
            </h2>

            <a href="/">

                <button>
                    Back to Home
                </button>

            </a>

            </body>

            </html>

            `);

        }
    );

});

/* =========================
   VIEW COMPLAINTS
========================= */

app.get("/complaints", (req, res) => {

    const sql = `
        SELECT * FROM complaints
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.log(err);

            return res.send(
                "Database Error"
            );

        }

        let html = `

        <html>

        <head>

        <title>
            Complaint Dashboard
        </title>

        <style>

        body{
            font-family:Arial;
            background:#f1f5f9;
            padding:20px;
        }

        h1{
            text-align:center;
            color:#1e293b;
        }

        table{
            width:100%;
            border-collapse:collapse;
            background:white;
            box-shadow:0 4px 10px rgba(0,0,0,0.2);
        }

        th{
            background:#1e293b;
            color:white;
            padding:15px;
        }

        td{
            padding:15px;
            text-align:center;
            border-bottom:1px solid #ddd;
        }

        tr:hover{
            background:#f8fafc;
        }

        .pending{
            background:red;
            color:white;
            padding:5px 10px;
            border-radius:10px;
        }

        .resolved{
            background:green;
            color:white;
            padding:5px 10px;
            border-radius:10px;
        }

        .high{
            background:red;
            color:white;
            padding:5px 10px;
            border-radius:10px;
        }

        .medium{
            background:orange;
            color:white;
            padding:5px 10px;
            border-radius:10px;
        }

        .low{
            background:green;
            color:white;
            padding:5px 10px;
            border-radius:10px;
        }

        button{
            padding:8px 15px;
            border:none;
            border-radius:8px;
            cursor:pointer;
            color:white;
        }

        .delete-btn{
            background:red;
        }

        .update-btn{
            background:green;
        }

        .top-btn{
            background:#2563eb;
            padding:12px 20px;
            margin-bottom:20px;
        }

        @media screen and (max-width:768px){

            table{
                font-size:12px;
            }

            th,
            td{
                padding:8px;
            }

        }

        </style>

        </head>

        <body>

        <h1>
            Complaint Management Dashboard
        </h1>

        <a href="/">

            <button class="top-btn">
                Back to Home
            </button>

        </a>

        <table>

        <tr>

            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Complaint</th>
            <th>Status</th>
            <th>Created Time</th>
            <th>Update</th>
            <th>Delete</th>

        </tr>

        `;

        results.forEach((row) => {

            const priority =
                row.priority || "Medium";

            const priorityClass =
                priority.toLowerCase();

            const category =
                row.category || "General";

            const status =
                row.status || "Pending";

            html += `

            <tr>

                <td>${row.id}</td>

                <td>${row.name}</td>

                <td>${row.email}</td>

                <td>${category}</td>

                <td>

                    <span class="${priorityClass}">

                        ${priority}

                    </span>

                </td>

                <td>${row.complaint}</td>

                <td>

                    <span class="${
                        status === "Resolved"
                        ? "resolved"
                        : "pending"
                    }">

                        ${status}

                    </span>

                </td>

                <td>${row.created_at}</td>

                <td>

                    <form
                        action="/update-status/${row.id}"
                        method="POST"
                    >

                        <input
                            type="hidden"
                            name="status"
                            value="Resolved"
                        >

                        <button class="update-btn">
                            Resolve
                        </button>

                    </form>

                </td>

                <td>

                    <form
                        action="/delete-complaint/${row.id}"
                        method="POST"
                    >

                        <button class="delete-btn">
                            Delete
                        </button>

                    </form>

                </td>

            </tr>

            `;

        });

        html += `

        </table>

        </body>

        </html>

        `;

        res.send(html);

    });

});

/* =========================
   UPDATE STATUS
========================= */

app.post("/update-status/:id", (req, res) => {

    const id = req.params.id;

    const status = req.body.status;

    const sql = `
        UPDATE complaints
        SET status=?
        WHERE id=?
    `;

    db.query(
        sql,
        [status, id],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.send(
                    "Update Failed"
                );

            }

            res.redirect("/complaints");

        }
    );

});

/* =========================
   DELETE COMPLAINT
========================= */

app.post("/delete-complaint/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        DELETE FROM complaints
        WHERE id=?
    `;

    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.send(
                    "Delete Failed"
                );

            }

            res.redirect("/complaints");

        }
    );

});

/* =========================
   SERVER
========================= */

const PORT = 5000;

app.listen(PORT, () => {

    console.log(
        `Server Running on http://localhost:${PORT}`
    );

});