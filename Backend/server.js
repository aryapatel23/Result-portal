const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db"); // ✅ Ensure the path is correct
const { initAttendanceCron } = require("./cron/attendanceCron"); // Import Student Attendance Cron
const { startTeacherAttendanceCron } = require("./cron/teacherAttendanceCron"); // Import Teacher Attendance Cron

dotenv.config();

connectDB();

// Start Automated Attendance Cron Jobs
console.log('🚀 Initializing Automated Cron Jobs...\n');
initAttendanceCron(); // Student attendance (8:00 PM IST)
startTeacherAttendanceCron(); // Teacher attendance (6:05 PM IST)
console.log('✅ All Cron Jobs Started!\n');

const app = express();


app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));
app.use("/api/admin", require("./routes/adminTeacherRoutes"));
app.use("/api/teacher", require("./routes/teacherRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/timetable", require("./routes/timetableRoutes"));
app.use("/api/bulk-students", require("./routes/bulkStudentRoutes"));
app.use("/api/student-promotion", require("./routes/studentPromotionRoutes"));
app.use("/api/bulk-results", require("./routes/bulkResultRoutes"));
app.use("/api/student-management", require("./routes/studentManagementRoutes"));
app.use("/api/pdf", require("./routes/pdfRoutes"));
app.use("/api/teacher-attendance", require("./routes/teacherAttendanceRoutes"));
app.use("/api/admin/attendance", require("./routes/adminAttendanceRoutes"));
app.use("/api/face", require("./routes/faceRegistrationRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/system-config", require("./routes/systemConfigRoutes")); // System configuration
app.use("/api/admin/holidays", require("./routes/holidayRoutes")); // Public holidays management
app.use("/api/test", require("./routes/testRoutes")); // Test endpoints for cron jobs

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