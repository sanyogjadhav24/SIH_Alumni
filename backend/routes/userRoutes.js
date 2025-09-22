const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
const Connection = require("../models/Connection");

const router = express.Router();

//  Cloudinary Config 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//  Multer Config 
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Register Route
router.post(
  "/register",
  upload.fields([
    { name: "documentFile", maxCount: 1 }, // mandatory
    { name: "profileUrl", maxCount: 1 },   // optional
  ]),
  async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        universityName,
        role,
        email,
        password,
        contactNumber,
        graduationYear,
        major,
      } = req.body;

      let documentLink = "";
      let profileLink = "";

      // Document - mandatory
      if (req.files && req.files.documentFile) {
        const uploadedDoc = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "alumniNet/documents" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.files.documentFile[0].buffer);
        });
        documentLink = uploadedDoc.secure_url;
      } else {
        return res.status(400).json({ message: "Document file is required" });
      }

      // Profile - optional
      if (req.files && req.files.profileUrl) {
        const uploadedProfile = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "alumniNet/profiles" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.files.profileUrl[0].buffer);
        });
        profileLink = uploadedProfile.secure_url;
      }

      // Check if user exists
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "User already exists" });

      // Hash Password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save User
      const newUser = await User.create({
        firstName,
        lastName,
        universityName,
        role,
        email,
        password: hashedPassword,
        contactNumber,
        documentLink,
        profileUrl: profileLink, // empty string if not uploaded
        graduationYear,
        major,
      });

      // JWT Token
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          universityName: newUser.universityName,
          role: newUser.role,
          contactNumber: newUser.contactNumber,
          documentLink: newUser.documentLink,
          profileUrl: newUser.profileUrl,
          graduationYear: newUser.graduationYear,
          major: newUser.major,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);


//  Login Route 
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        universityName: user.universityName,
        role: user.role,
        contactNumber: user.contactNumber,
        documentLink: user.documentLink,
        profileUrl: user.profileUrl,
        graduationYear: user.graduationYear,
        major: user.major,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// EDIT Profile Route 
router.put(
  "/edit",
  upload.fields([
    { name: "documentLink", maxCount: 1 },
    { name: "profileUrl", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "No token" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const {
        firstName,
        lastName,
        universityName,
        email,
        oldPassword,
        newPassword,
        contactNumber,
        graduationYear,
      } = req.body;

      let documentLink = user.documentLink;
      let profileLink = user.profileUrl;

      // ✅ Detect if anything changed before uploading
      const wantsToChange =
        (firstName && firstName !== user.firstName) ||
        (lastName && lastName !== user.lastName) ||
        (universityName && universityName !== user.universityName) ||
        (email && email !== user.email) ||
        (contactNumber && contactNumber !== user.contactNumber) ||
        (graduationYear && graduationYear !== user.graduationYear) ||
        newPassword ||
        (req.files?.documentLink && req.files.documentLink.length > 0) ||
        (req.files?.profileUrl && req.files.profileUrl.length > 0);

      if (!wantsToChange) {
        return res.json({ message: "Profile already up to date", user });
      }

      // ✅ If changes, check old password
      if (wantsToChange) {
        if (!oldPassword) {
          return res
            .status(400)
            .json({ message: "Old password required to save changes" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          return res
            .status(400)
            .json({ message: "Old password incorrect. Try again." });
        }
      }

      // ✅ Upload only if new file selected
      if (req.files?.documentLink && req.files.documentLink.length > 0) {
        const uploadedDoc = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "alumniNet/documents" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.files.documentLink[0].buffer);
        });
        documentLink = uploadedDoc.secure_url;
      }

      if (req.files?.profileUrl && req.files.profileUrl.length > 0) {
        const uploadedProfile = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "alumniNet/profiles" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.files.profileUrl[0].buffer);
        });
        profileLink = uploadedProfile.secure_url;
      }

      // ✅ Hash new password if provided
      let hashedPassword = user.password;
      if (newPassword) {
        hashedPassword = await bcrypt.hash(newPassword, 10);
      }

      // ✅ Apply updates
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.universityName = universityName || user.universityName;
      user.email = email || user.email;
      user.contactNumber = contactNumber || user.contactNumber;
      user.graduationYear = graduationYear || user.graduationYear;
      user.documentLink = documentLink;
      user.profileUrl = profileLink;
      user.password = hashedPassword;

      await user.save();

      res.json({
        message: "Profile updated successfully",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          universityName: user.universityName,
          role: user.role,
          contactNumber: user.contactNumber,
          graduationYear: user.graduationYear,
          documentLink: user.documentLink,
          profileUrl: user.profileUrl,
          major: user.major,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);




// Get Current User 
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Get All Users (for network connections)
router.get("/", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id).populate('connections');
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    // Get users who haven't received requests and aren't connected
    const sentRequestUserIds = [];
    const allUsers = await User.find({}).select('connectionRequests');
    
    allUsers.forEach(user => {
      user.connectionRequests.forEach(req => {
        if (req.from.toString() === decoded.id && req.status === 'pending') {
          sentRequestUserIds.push(user._id.toString());
        }
      });
    });

    const connectedUserIds = currentUser.connections.map(c => c._id.toString());
    const excludeIds = [...sentRequestUserIds, ...connectedUserIds, decoded.id];
    
    // Filter based on user role
    let roleFilter = {};
    if (currentUser.role === 'student') {
      roleFilter = { role: 'alumni' };
    } else if (currentUser.role === 'alumni') {
      roleFilter = { 
        $or: [
          { role: 'student' },
          { role: 'alumni', universityName: currentUser.universityName }
        ]
      };
    }
    
    const users = await User.find({ 
      _id: { $nin: excludeIds },
      ...roleFilter
    }).select("-password");
    
    // Add mutual connections count and connection timestamps
    const usersWithMutuals = await Promise.all(users.map(async (user) => {
      const mutualCount = await getMutualConnectionsCount(decoded.id, user._id);
      return {
        ...user.toObject(),
        mutualConnections: mutualCount
      };
    }));
    
    res.json(usersWithMutuals);
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Get User Connections
router.get("/connections", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .populate({
        path: 'connections',
        select: 'firstName lastName role major graduationYear universityName email createdAt'
      });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    // Add connection timestamps and mutual connections
    const connectionsWithDetails = await Promise.all(user.connections.map(async (conn) => {
      const mutualCount = await getMutualConnectionsCount(decoded.id, conn._id);
      return {
        ...conn.toObject(),
        mutualConnections: mutualCount,
        connectedAt: conn.createdAt || new Date()
      };
    }));

    res.json({
      connections: connectionsWithDetails,
      connectionCount: user.connections.length,
      pendingCount: user.connectionRequests.filter(r => r.status === 'pending').length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Send Connection Request
router.post("/connect", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { targetUserId } = req.body;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    // Check if request already exists
    const existingRequest = targetUser.connectionRequests.find(
      req => req.from.toString() === decoded.id
    );
    if (existingRequest) {
      return res.status(400).json({ message: "Connection request already sent" });
    }

    // Add connection request
    targetUser.connectionRequests.push({ from: decoded.id });
    await targetUser.save();

    res.json({ message: "Connection request sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Connection Requests
router.get("/connection-requests", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .populate('connectionRequests.from', 'firstName lastName role major graduationYear universityName email');
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const pendingRequests = user.connectionRequests.filter(req => req.status === 'pending');
    res.json(pendingRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Accept/Decline Connection Request
router.post("/connection-request/:action", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { action } = req.params; // 'accept' or 'decline'
    const { requestId } = req.body;

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const request = user.connectionRequests.id(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (action === 'accept') {
      // Add to connections
      user.connections.push(request.from);
      const fromUser = await User.findById(request.from);
      fromUser.connections.push(decoded.id);
      await fromUser.save();
      
      request.status = 'accepted';
    } else if (action === 'decline') {
      request.status = 'declined';
    }

    await user.save();
    res.json({ message: `Connection request ${action}ed successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get User Stats
router.get("/stats", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      profileViews: user.profileViews || 0,
      connectionCount: user.connections.length,
      pendingCount: user.connectionRequests.filter(r => r.status === 'pending').length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Navigation Counts
router.get("/nav-counts", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    // Calculate real-time counts
    const connections = user.connections.length;
    const unreadMessages = 0; // TODO: Implement when message system is ready
    const unreadNotifications = user.connectionRequests.filter(r => r.status === 'pending').length;
    const upcomingEvents = 0; // TODO: Implement when event system is ready
    const availableJobs = 0; // TODO: Implement when job system is ready

    res.json({
      connections,
      unreadMessages,
      unreadNotifications,
      upcomingEvents,
      availableJobs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get All Notifications
router.get("/notifications", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('connectionRequests.from', 'firstName lastName role major graduationYear');
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const notifications = [];
    
    // Connection request notifications
    user.connectionRequests.filter(r => r.status === 'pending').forEach(req => {
      notifications.push({
        id: req._id,
        type: 'connection',
        title: 'New Connection Request',
        message: `${req.from.firstName} ${req.from.lastName} wants to connect with you.`,
        details: `${req.from.role === 'alumni' ? 'Alumni' : 'Student'} - ${req.from.major || req.from.role}`,
        time: new Date(req.createdAt || Date.now()).toLocaleDateString(),
        avatar: req.from.firstName[0] + req.from.lastName[0],
        isRead: false,
        requestId: req._id,
        fromUserId: req.from._id
      });
    });

    // Mock job notifications for demo
    const jobNotifications = [
      {
        id: 'job1',
        type: 'job',
        title: 'New Job Opportunity',
        message: 'Software Engineer position at Google matches your profile.',
        time: '2 hours ago',
        isRead: false
      },
      {
        id: 'job2', 
        type: 'job',
        title: 'Job Application Update',
        message: 'Your application for Product Manager at Meta is under review.',
        time: '1 day ago',
        isRead: true
      }
    ];

    notifications.push(...jobNotifications);

    res.json({
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get User Profile
router.get("/profile/:id", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = req.params;
    
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Increment profile views
    await User.findByIdAndUpdate(id, { $inc: { profileViews: 1 } });
    
    // Get mutual connections
    const mutualCount = await getMutualConnectionsCount(decoded.id, id);
    
    res.json({
      ...user.toObject(),
      mutualConnections: mutualCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Send Message
router.post("/message", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { recipientId, message } = req.body;
    
    // For now, just return success - full messaging system would need separate Message model
    res.json({ message: "Message sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Helper function to calculate mutual connections
async function getMutualConnectionsCount(user1Id, user2Id) {
  try {
    const user1 = await User.findById(user1Id).select('connections');
    const user2 = await User.findById(user2Id).select('connections');
    
    if (!user1 || !user2) return 0;
    
    const user1Connections = user1.connections.map(id => id.toString());
    const user2Connections = user2.connections.map(id => id.toString());
    
    const mutuals = user1Connections.filter(id => user2Connections.includes(id));
    return mutuals.length;
  } catch (error) {
    return 0;
  }
}

module.exports = router;
