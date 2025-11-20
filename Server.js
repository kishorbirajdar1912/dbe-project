// ==================== IMPORTS ====================

const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = 3000;

// ==================== MIDDLEWARE ====================

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static frontend files (HTML, CSS, JS) from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// ==================== MYSQL CONNECTION ====================

const db = mysql.createConnection({
  host: "localhost",      // MySQL host
  port: 3306,             // default port
  user: "root",           // default MySQL user (XAMPP/WAMP)
  password: "",           // blank for local setup
  database: "student_db",   // database you created in Workbench
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL: student_db");
  }
});

// ==================== ROUTES ====================

// ----------- ADD STUDENT (POST /add-student) -----------
app.post("/add-student", async (req, res) => {
  try {
    const { student_id, name, email, course, semester } = req.body;

    // Validate required fields
    if (!student_id || !name || !email || !course || !semester) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Insert student into database
    db.query(
      "INSERT INTO students (student_id, name, email, course, semester) VALUES (?, ?, ?, ?, ?)",
      [student_id, name, email, course, semester],
      (err) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.json({
              success: false,
              message: "Student ID already exists",
            });
          }
          console.error("❌ DB Insert Error:", err);
          return res
            .status(500)
            .json({ success: false, message: "Database error" });
        }
        res.json({ success: true, message: "Student added successfully" });
      }
    );
  } catch (e) {
    console.error("❌ Server Error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------- GET ALL STUDENTS (GET /students) -----------
app.get("/students", (req, res) => {
  db.query("SELECT * FROM students", (err, rows) => {
    if (err) {
      console.error("❌ DB Query Error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }
    res.json({ success: true, students: rows });
  });
});

// ----------- DELETE STUDENT (DELETE /delete-student) -----------
app.delete("/delete-student/:id", (req, res) => {
  const studentId = req.params.id;

  db.query("DELETE FROM students WHERE student_id = ?", [studentId], (err, result) => {
    if (err) {
      console.error("❌ DB Delete Error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }
    
    if (result.affectedRows === 0) {
      return res.json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, message: "Student deleted successfully" });
  });
});

// ----------- UPDATE STUDENT (PUT /update-student) -----------
app.put("/update-student/:id", (req, res) => {
  const studentId = req.params.id;
  const { name, email, course, semester } = req.body;

  if (!name || !email || !course || !semester) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  db.query(
    "UPDATE students SET name = ?, email = ?, course = ?, semester = ? WHERE student_id = ?",
    [name, email, course, semester, studentId],
    (err, result) => {
      if (err) {
        console.error("❌ DB Update Error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }
      
      if (result.affectedRows === 0) {
        return res.json({ success: false, message: "Student not found" });
      }

      res.json({ success: true, message: "Student updated successfully" });
    }
  );
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});