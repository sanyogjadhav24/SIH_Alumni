const express = require("express");
const router = express.Router();
const multer = require("multer");
const Event = require("../models/Event");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary"); 

// Multer in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create Event
router.post("/create", upload.single("poster"), async (req, res) => {
  try {
    const { title, date, mode, venue, createdBy, registeredUsers, donationAccepted, description } = req.body;

    if (!title || !date || !mode || !createdBy || !description) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (mode === "offline" && !venue) {
      return res.status(400).json({ message: "Venue is required for offline events" });
    }

    if (req.file) {
      if (!req.file.buffer) {
        return res.status(400).json({ message: "Poster file buffer missing" });
      }
    }

    let posterUrl = null;
    if (req.file && req.file.buffer) {
      posterUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "events" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(req.file.buffer);
      });
    }

    const event = new Event({
      title,
      date: new Date(date),
      mode,
      venue: mode === "offline" ? venue : null,
      posterUrl,
      createdBy,
      registeredUsers: registeredUsers ? JSON.parse(registeredUsers) : [],
      donationAccepted: donationAccepted === "true", // ✅ convert string to boolean
      description,
    });

    await event.save();
    res.status(201).json({ message: "Event created successfully", event });
  } catch (err) {
    console.error("Event creation error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

  router.get("/all", async (req, res) => {
    try {
      const events = await Event.find({}).sort({ date: 1 }) 
      res.json({ events })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Failed to fetch events", error: err.message })
    }
  })

// Register/RSVP to Event
router.post("/register/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body; 

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //Check if already registered
    if (event.registeredUsers.includes(userId) || user.registeredEvents.includes(eventId)) {
      return res.status(400).json({ message: "Already registered" });
    }

    //Add userId 
    event.registeredUsers.push(userId);
    await event.save();

    //Add eventId 
    user.registeredEvents.push(eventId);
    await user.save();

    res.json({
      message: "Successfully registered for event",
      event,
      user,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;


module.exports = router;
