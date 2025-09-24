require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
<<<<<<< HEAD
const eventRoutes = require("./routes/eventRoutes");
=======
const postRoutes = require("./routes/postRoutes");
>>>>>>> 9f48cd27435d62d8211e7091e970fb518020bc6a



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
<<<<<<< HEAD
app.use("/api/events", eventRoutes);
=======
app.use("/api/posts", postRoutes);

>>>>>>> 9f48cd27435d62d8211e7091e970fb518020bc6a

// Server start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// dothis is the functionality implemented in the backend server.js file