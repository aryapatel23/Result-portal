const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db"); // ✅ Ensure the path is correct

dotenv.config();

connectDB();

const app = express();


app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));
app.use("/api/admin", require("./routes/adminTeacherRoutes"));
app.use("/api/teacher", require("./routes/teacherRoutes"));
app.use("/api/student", require("./routes/studentRoutes")); 
app.use("/api", require("./routes/timetableRoutes"));
app.use("/api/bulk-students", require("./routes/bulkStudentRoutes"));
app.use("/api/student-promotion", require("./routes/studentPromotionRoutes"));
app.use("/api/bulk-results", require("./routes/bulkResultRoutes"));
app.use("/api/student-management", require("./routes/studentManagementRoutes"));
app.use("/api/pdf", require("./routes/pdfRoutes"));
app.use("/api/teacher-attendance", require("./routes/teacherAttendanceRoutes"));
app.use("/api/admin/attendance", require("./routes/adminAttendanceRoutes")); 
app.use("/api/face", require("./routes/faceRegistrationRoutes"));

console.log('✅ All routes registered including timetable routes'); 


app.get("/", (req, res) => {
  res.send("📘 Student Result Portal API is running.");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 Access from this computer: http://localhost:${PORT}`);
  console.log(`🌐 Access from network: http://172.29.112.1:${PORT}`);
});