const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db"); // ✅ Ensure the path is correct

dotenv.config();

connectDB();

const app = express();


app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/results", require("./routes/resultRoutes")); 


app.get("/", (req, res) => {
  res.send("📘 Student Result Portal API is running.");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
