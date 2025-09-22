const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");

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

module.exports = router;
