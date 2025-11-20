const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

// SQLite Database (file-based, no setup needed)
const db = new sqlite3.Database(':memory:'); // or use './student.db' for file

// Create table
db.serialize(() => {
  db.run(`CREATE TABLE students (
    student_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    course TEXT NOT NULL,
    semester TEXT NOT NULL
  )`);

  // Add sample data
  db.run(`INSERT INTO students VALUES 
    ('S001', 'John Doe', 'john@email.com', 'CS', 'Sem 1'),
    ('S002', 'Jane Smith', 'jane@email.com', 'EE', 'Sem 2')`);
});

// Routes
app.post("/add-student", (req, res) => {
  const { student_id, name, email, course, semester } = req.body;
  
  db.run(
    `INSERT INTO students VALUES (?, ?, ?, ?, ?)`,
    [student_id, name, email, course, semester],
    function(err) {
      if (err) {
        return res.json({ success: false, message: "Error adding student" });
      }
      res.json({ success: true, message: "Student added!" });
    }
  );
});

app.get("/students", (req, res) => {
  db.all("SELECT * FROM students", [], (err, rows) => {
    if (err) {
      return res.json({ success: false, message: "Error" });
    }
    res.json({ success: true, students: rows });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});