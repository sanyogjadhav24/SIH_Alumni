require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const { router: jobRoutes } = require("./routes/jobRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection with retry (avoid process.exit in dev)
const connectDB = async (retries = 5, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("✅ MongoDB connected");
      return;
    } catch (err) {
      console.error(`❌ MongoDB connection attempt ${i + 1} failed:`, err.message);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        console.error('Could not connect to MongoDB after retries. Continuing without DB is not recommended.');
      }
    }
  }
};
connectDB();

// Global process handlers to catch and log uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);


// Server start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
