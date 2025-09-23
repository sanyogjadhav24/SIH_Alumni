require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");



const app = express();

// Middleware
app.use(express.json());
app.use(cors({ 
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"], 
  credentials: true 
}));

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // stop the app if DB fails
  }
};
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);


// Server start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
