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

//  Multer Config for Local Storage
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = file.fieldname === 'documentFile' || file.fieldname === 'documentLink' 
      ? path.join(__dirname, '../uploads/documents') 
      : path.join(__dirname, '../uploads/profiles');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: localStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow common document and image formats
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|csv|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
  cb(new Error('Invalid file type. Only PDF, DOC, DOCX, CSV, XLS, XLSX, JPG, JPEG, PNG files are allowed.'));
    }
  }
});

const { sha256Buffer } = require('../utils/hashUtil');
let pdfParse = null;
try { pdfParse = require('pdf-parse'); } catch(e) { console.warn('pdf-parse not available; PDF text fallback disabled') }
let tesseract = null;
try { tesseract = require('tesseract.js'); } catch(e) { console.warn('tesseract.js not available; OCR fallback disabled') }
const contractService = require('../services/contractService');
const AdminDocument = require('../models/AdminDocument');
const Notification = require('../models/Notification');
const AdminRecord = require('../models/AdminRecord');
const mongoose = require('mongoose');

// Helper: extract normalized text and return textHash (0x...) or null
async function computeTextHashForFile(filePath, originalName) {
  try {
    const ext = path.extname(originalName).toLowerCase();
    // PDF text
    if (ext === '.pdf' && pdfParse) {
      const data = await pdfParse(fs.readFileSync(filePath));
      if (data && data.text) {
        const normalized = data.text.replace(/\s+/g, ' ').trim().toLowerCase();
        return '0x' + sha256Buffer(Buffer.from(normalized));
      }
    }

    // Image OCR
      // Only run OCR when explicitly enabled via env to avoid heavy CPU usage during bulk uploads
      if (['.jpg', '.jpeg', '.png', '.tif', '.tiff'].includes(ext) && tesseract && process.env.ENABLE_OCR === 'true') {
      try {
        const { createWorker } = tesseract;
        const worker = createWorker();
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(filePath);
        await worker.terminate();
        if (text) {
          const normalized = text.replace(/\s+/g, ' ').trim().toLowerCase();
          return '0x' + sha256Buffer(Buffer.from(normalized));
        }
      } catch (ocrErr) {
        console.warn('OCR failed for', originalName, ocrErr);
      }
    }
  } catch (err) {
    console.warn('computeTextHashForFile error', err);
  }
  return null;
}

// Simple Levenshtein distance (iterative, low-memory)
function levenshtein(a, b) {
  if (!a) return b ? b.length : 0;
  if (!b) return a.length;
  const alen = a.length; const blen = b.length;
  const v0 = new Array(blen + 1);
  const v1 = new Array(blen + 1);
  for (let j = 0; j <= blen; j++) v0[j] = j;
  for (let i = 0; i < alen; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < blen; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= blen; j++) v0[j] = v1[j];
  }
  return v1[blen];
}

function similarityScore(a, b) {
  if (!a && !b) return 1;
  const la = a ? a.length : 0;
  const lb = b ? b.length : 0;
  const max = Math.max(la, lb);
  if (max === 0) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / max;
}

// Fuzzy-find AdminRecord candidate by looking up by institute tokens and percentage, then scoring
async function fuzzyFindAdminRecord(name, institute, percentage, threshold = 0.82) {
  // Helper: normalize name (strip honorifics, reorder "Last, First" to "First Last")
  function normalizeName(s) {
    if (!s) return '';
    let v = s.replace(/\s+/g, ' ').trim();
    // strip common honorifics
    v = v.replace(/^((mr|mrs|ms|miss|dr|prof|sir|smt|shri)\.?:?\s+)/i, '');
    v = v.replace(/,\s*/g, ',');
    // reorder Last, First => First Last
    if (/,/.test(v)) {
      const parts = v.split(',').map(p=>p.trim());
      if (parts.length >= 2) v = parts.slice(1).concat(parts[0]).join(' ');
    }
    return v.toLowerCase();
  }

  function normalizeInstitute(s) {
    if (!s) return '';
    let v = s.replace(/\s+/g, ' ').trim().toLowerCase();
    // remove common suffix words
    v = v.replace(/\b(university|college|institute|center|centre|school|dept|department)\b/g, '');
    // collapse extra spaces
    v = v.replace(/\s+/g, ' ').trim();
    return v;
  }

  function normalizePercent(s) {
    if (s === undefined || s === null) return '';
    const str = String(s).replace(/[^0-9\.\-]/g, '').trim();
    return str;
  }

  // Normalize inputs
  const nName = normalizeName(name || '');
  const nInstitute = normalizeInstitute(institute || '');
  const nPercentage = normalizePercent(percentage);

  // Build a regex from first 4 words of institute to narrow search
  const instTokens = nInstitute.split(/\s+/).filter(Boolean).slice(0,4).join(' ');
  const instRegex = instTokens ? new RegExp(instTokens.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;

  const orFilters = [];
  if (instRegex) orFilters.push({ institute: { $regex: instRegex } });
  if (nPercentage) orFilters.push({ percentage: nPercentage });
  // fallback: search recent records if nothing else
  const query = orFilters.length ? { $or: orFilters } : {};

  let candidates = await AdminRecord.find(query).limit(500).lean();
  if (!candidates || candidates.length === 0) {
    // widen search to small sample (most recent 500)
    candidates = await AdminRecord.find({}).sort({ createdAt: -1 }).limit(500).lean();
  }

  let best = null;
  let bestScore = 0;
  // Weigh components: name and institute more important than percentage
  const weights = { name: 0.52, institute: 0.38, percentage: 0.10 };

  for (const c of candidates) {
    const candName = normalizeName(c.name || '');
    const candInst = normalizeInstitute(c.institute || '');
    const candPerc = normalizePercent(c.percentage || '');

    // Name similarity (fuzzy)
    const nameScore = candName && nName ? similarityScore(nName, candName) : (nName || candName ? 0 : 1);
    // Institute similarity (fuzzy)
    const instScore = candInst && nInstitute ? similarityScore(nInstitute, candInst) : (nInstitute || candInst ? 0 : 1);

    // Percentage: exact or small numeric tolerance
    let percScore = 0;
    if (!nPercentage && !candPerc) percScore = 1;
    else if (nPercentage && candPerc) {
      const a = parseFloat(nPercentage);
      const b = parseFloat(candPerc);
      if (!isNaN(a) && !isNaN(b)) {
        const diff = Math.abs(a - b);
        // tolerant up to 2 percentage points by score mapping
        if (diff === 0) percScore = 1;
        else if (diff <= 1) percScore = 0.9;
        else if (diff <= 2) percScore = 0.75;
        else percScore = 0;
      } else {
        percScore = nPercentage === candPerc ? 1 : 0;
      }
    }

    const overall = (nameScore * weights.name) + (instScore * weights.institute) + (percScore * weights.percentage);

    // Prefer matches where name+institute are both strong even if percentage is missing
    const nameInstCombined = (nameScore + instScore) / 2;
    const nameInstPreferred = nameInstCombined >= 0.78 && (nameScore >= 0.72 || instScore >= 0.72);

    const score = overall;
    if ((nameInstPreferred && score >= (threshold - 0.02)) || score >= threshold) {
      // return best immediate match
      return { record: c, score };
    }
    if (score > bestScore) { bestScore = score; best = c; }
  }

  if (best && bestScore >= threshold) return { record: best, score: bestScore };
  return null;
}

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

      // Document - mandatory (now using local storage)
      let documentFileObj = null;
      let documentHash = null;
      if (req.files && req.files.documentFile) {
        try {
          const file = req.files.documentFile[0];
          documentFileObj = file;
          console.log('Uploading document file:', file.originalname);
          console.log('File path:', file.path);
          console.log('File filename:', file.filename);

          documentLink = `/api/users/file/${file.filename}`;
          console.log("Document uploaded successfully to local storage:", documentLink);

          // Compute SHA-256 of the uploaded document so we can store it on the user record
          try {
            const fileBuffer = fs.readFileSync(file.path);
            documentHash = '0x' + sha256Buffer(fileBuffer);
            console.log('Computed document hash for registration:', documentHash);
          } catch (hashErr) {
            console.warn('Failed to compute document hash during registration', hashErr);
            documentHash = null;
          }
        } catch (uploadError) {
          console.error("Error processing document:", uploadError);
          return res.status(500).json({ message: "Failed to upload document" });
        }
      } else {
        return res.status(400).json({ message: "Document file is required" });
      }

      // Profile - optional (now using local storage)
      if (req.files && req.files.profileUrl) {
        try {
          const file = req.files.profileUrl[0];
          console.log('Uploading profile file:', file.originalname);
          console.log('File path:', file.path);
          console.log('File filename:', file.filename);
          
          profileLink = `/api/users/file/${file.filename}`;
          console.log("Profile uploaded successfully to local storage:", profileLink);
        } catch (uploadError) {
          console.error("Error processing profile picture:", uploadError);
          // Don't fail registration for optional profile picture
          profileLink = "";
        }
      }

      // Check if user exists
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "User already exists" });

      // Hash Password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save User (include documentHash when available)
      const newUser = await User.create({
        firstName,
        lastName,
        universityName,
        role,
        email,
        password: hashedPassword,
        contactNumber,
        documentLink,
        documentHash: documentHash || undefined,
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

      // Create an admin notification so admins can review new registrations
      try {
        await Notification.create({
          type: 'new_registration',
          message: `New registration: ${firstName} ${lastName} (${email})`,
          payload: {
            userId: newUser._id,
            email,
            documentHash: documentHash,
            documentLink: documentLink,
          },
        });
      } catch (notifyErr) {
        console.warn('Failed to create admin notification for new registration', notifyErr);
      }
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

    // If user is an alumni and not verified, block login and notify
    if (user.role === 'alumni' && !user.isVerified) {
      return res.status(403).json({ message: 'Account pending admin verification. Please wait for approval.' });
    }

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


router.put(
  "/edit",
  upload.fields([
    { name: "documentLink", maxCount: 1 }, // match frontend
    { name: "profileUrl", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ 
          message: "Authentication required", 
          requiresLogin: true 
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (jwtError) {
        return res.status(401).json({ 
          message: "Invalid or expired token", 
          requiresLogin: true 
        });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ 
          message: "User not found", 
          requiresLogin: true 
        });
      }

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

      // validate contact number
      if (contactNumber === "") {
        return res.status(400).json({ message: "Contact number cannot be empty" });
      }

      // Handle file uploads using local storage
      let documentLink = user.documentLink;
      let profileLink = user.profileUrl;

      // Document upload - using local storage
      if (req.files?.documentLink) {
        try {
          const file = req.files.documentLink[0];
          console.log('Updating document file:', file.originalname);
          console.log('File path:', file.path);
          console.log('File filename:', file.filename);
          
          documentLink = `/api/users/file/${file.filename}`;
          console.log("Document updated successfully:", documentLink);
          // compute hash for the new document and store on user record
          try {
            const fileBuffer = fs.readFileSync(file.path);
            const newDocHash = '0x' + sha256Buffer(fileBuffer);
            user.documentHash = newDocHash;
            console.log('Computed new document hash on edit:', newDocHash);
            // Notify admins that this user updated their document
            try {
              await Notification.create({
                type: 'document_updated',
                message: `User ${user.email} updated their document`,
                payload: { userId: user._id, email: user.email, documentHash: newDocHash },
              });
            } catch (nErr) {
              console.warn('Failed to create document_updated notification', nErr);
            }
          } catch (hashErr) {
            console.warn('Failed to compute document hash during edit', hashErr);
          }
        } catch (uploadError) {
          console.error("Error updating document:", uploadError);
          return res.status(500).json({ message: "Failed to update document" });
        }
      }

      // Profile upload - using local storage
      if (req.files?.profileUrl) {
        try {
          const file = req.files.profileUrl[0];
          console.log('Updating profile file:', file.originalname);
          console.log('File path:', file.path);
          console.log('File filename:', file.filename);
          
          profileLink = `/api/users/file/${file.filename}`;
          console.log("Profile updated successfully:", profileLink);
        } catch (uploadError) {
          console.error("Error updating profile picture:", uploadError);
          return res.status(500).json({ message: "Failed to update profile picture" });
        }
      }

      //  Detect any changes 
      const hasChanges =
        (firstName && firstName !== user.firstName) ||
        (lastName && lastName !== user.lastName) ||
        (universityName && universityName !== user.universityName) ||
        (email && email !== user.email) ||
        (contactNumber && contactNumber !== user.contactNumber) ||
        (graduationYear && graduationYear !== user.graduationYear) ||
        documentLink !== user.documentLink ||
        profileLink !== user.profileUrl ||
        newPassword;

      // If changes, validate old password 
      if (hasChanges) {
        if (!oldPassword) {
          return res.status(400).json({ message: "Old password required to save changes" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Old password incorrect. Try again." });
        }
      }

      let hashedPassword = user.password;
      if (newPassword) {
        hashedPassword = await bcrypt.hash(newPassword, 10);
      }

      //  Update user fields 
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

      //  Return updated user 
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
      
      // Handle JWT errors specifically
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: "Authentication failed", 
          requiresLogin: true 
        });
      }
      
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get Current User 
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ 
        message: "Authentication required", 
        requiresLogin: true 
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ 
        message: "Invalid or expired token", 
        requiresLogin: true 
      });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ 
        message: "User not found", 
        requiresLogin: true 
      });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(401).json({ 
      message: "Authentication failed", 
      requiresLogin: true 
    });
  }
});

// Save wallet address for authenticated user
router.post('/set-wallet', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { walletAddress } = req.body;
    if (!walletAddress) return res.status(400).json({ message: 'walletAddress required' });

    user.walletAddress = walletAddress;
    await user.save();
    res.json({ success: true, walletAddress });
  } catch (err) {
    console.error('Set wallet error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: upload multiple documents (multipart field 'documents') and store their SHA-256 on-chain
router.post('/admin/upload-dataset', upload.array('documents', 20), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

  if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No files uploaded' });

  // preflight: limit number of files and approximate total size to avoid OOM/CPU spikes
  const MAX_FILES = 20;
  const MAX_TOTAL_BYTES = 50 * 1024 * 1024; // 50MB total
  if (req.files.length > MAX_FILES) return res.status(400).json({ message: `Too many files. Max ${MAX_FILES} allowed per request.` });
  let totalBytes = 0;
  for (const f of req.files) totalBytes += f.size || 0;
  if (totalBytes > MAX_TOTAL_BYTES) return res.status(400).json({ message: `Total upload size too large. Max ${MAX_TOTAL_BYTES} bytes allowed.` });

    const results = [];
    for (const file of req.files) {
      const fileBuffer = fs.readFileSync(file.path);
      const hashHex = '0x' + sha256Buffer(fileBuffer);
      try {
        // compute textHash via PDF text extraction or OCR (if available)
        let textHash = await computeTextHashForFile(file.path, file.originalname);

        const resp = await contractService.storeDocumentHash(hashHex);

        // Persist AdminDocument record for auditing and admin UI
        try {
          await AdminDocument.create({
            filename: file.filename,
            originalName: file.originalname,
            hash: hashHex,
            textHash: textHash,
            uploadedBy: user._id,
          });
        } catch (admErr) {
          console.warn('Failed to persist AdminDocument for', file.filename, admErr);
        }

        // contractService either returns tx-like object or local store result
        if (resp && resp.local) {
          results.push({ filename: file.filename, hash: hashHex, status: 'stored-local', info: resp });
        } else {
          results.push({ filename: file.filename, hash: hashHex, status: 'stored-onchain', tx: resp });
        }
      } catch (e) {
        console.error('Error storing hash for', file.filename, e && e.message ? e.message : e);
        results.push({ filename: file.filename, hash: hashHex, status: 'error', error: e && e.message ? e.message : String(e) });
      }
    }

    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: upload CSV of past students with fields Name, Institute, Percentage
// CSV field names (header) may be: name,institute,percentage (case-insensitive)
// Simple ping route for admin to verify backend mount
router.get('/admin/ping', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ ok: false, message: 'Authentication required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ ok: false, message: 'Admin access required' });
    res.json({ ok: true, message: 'pong' });
  } catch (err) {
    console.error('Admin ping error', err);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});
router.post('/admin/upload-csv', upload.single('csvFile'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

    if (!req.file) return res.status(400).json({ message: 'CSV file is required (field: csvFile)' });

    const ext = path.extname(req.file.originalname).toLowerCase();
    let records = [];

    if (ext === '.xls' || ext === '.xlsx') {
      // Excel file: try to parse with 'xlsx' package if available
      let xlsx = null;
      try { xlsx = require('xlsx'); } catch (e) { xlsx = null; }
      if (!xlsx) {
        return res.status(500).json({ message: "Excel parsing requires the 'xlsx' package. Install it: npm install xlsx" });
      }
      try {
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        records = xlsx.utils.sheet_to_json(sheet, { defval: '' });
      } catch (e) {
        console.error('Failed to parse Excel file', e);
        return res.status(400).json({ message: 'Failed to parse Excel file' });
      }
    } else {
      const csvBuffer = fs.readFileSync(req.file.path);
      const csvText = csvBuffer.toString('utf8');

      // Try csv-parse if available
      let parse = null;
      try { parse = require('csv-parse/lib/sync'); } catch (e) { parse = null; }

      if (parse) {
        try {
          records = parse(csvText, { columns: true, skip_empty_lines: true });
        } catch (e) {
          console.warn('csv-parse failed, falling back to simple parse', e);
        }
      }

      if (!records || records.length === 0) {
        // simple fallback: split lines, expect header
        const lines = csvText.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
        if (lines.length <= 1) return res.status(400).json({ message: 'CSV has no data rows' });
        const headers = lines[0].split(',').map(h=>h.trim().toLowerCase());
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          const obj = {};
          headers.forEach((h, idx) => obj[h] = (cols[idx] || '').trim());
          records.push(obj);
        }
      }
    }

    const results = [];
    for (const r of records) {
      const name = (r.name || r.Name || r.NAME || r['student name'] || '').trim();
      const institute = (r.institute || r.Institute || r.college || r['college name'] || r['institute name'] || '').trim();
      const percentage = (r.percentage || r.Percentage || r.marks || r['percent'] || '').toString().trim();
      if (!name || !institute || !percentage) {
        results.push({ row: r, status: 'skipped', reason: 'missing fields' });
        continue;
      }

      const normalized = `${name}|${institute}|${percentage}`.replace(/\s+/g,' ').trim().toLowerCase();
      const normalizedHash = '0x' + sha256Buffer(Buffer.from(normalized));

      try {
        await AdminRecord.create({ name, institute, percentage, normalizedHash, uploadedBy: user._id });
      } catch (e) {
        console.warn('Failed to persist AdminRecord', e);
      }

      try {
        await contractService.storeDocumentHash(normalizedHash);
      } catch (e) {
        console.warn('Failed to store normalizedHash on chain/local', e);
      }

      results.push({ name, institute, percentage, normalizedHash, status: 'stored' });
    }

    res.json({ results });
  } catch (err) {
    console.error('Admin upload CSV error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Alumni: verify marksheet
// Accepts multipart file (marksheet image/pdf) under 'marksheet' OR JSON body with fields: name, institute, percentage
router.post('/verify-marksheet', upload.single('marksheet'), async (req, res) => {
  try {
    let name = req.body.name || '';
    let institute = req.body.institute || '';
    let percentage = req.body.percentage || '';

    if (req.file) {
      // attempt to extract text from PDF or image using pdf-parse or OCR (if enabled)
      let extractedText = '';
      try {
        if (path.extname(req.file.originalname).toLowerCase() === '.pdf' && pdfParse) {
          const data = await pdfParse(fs.readFileSync(req.file.path));
          extractedText = data.text || '';
        } else {
          // OCR only if enabled
          if (process.env.ENABLE_OCR === 'true' && tesseract) {
            const { createWorker } = tesseract;
            const worker = createWorker();
            await worker.load();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            const { data: { text } } = await worker.recognize(req.file.path);
            await worker.terminate();
            extractedText = text || '';
          }
        }
      } catch (e) { console.warn('Failed to extract text from marksheet', e); }

      // basic heuristics to pull name, institute and percentage from extracted text
      if (!name) {
        const m = extractedText.match(/name[:\-\s]*([A-Za-z\s\.]+)/i);
        if (m) name = m[1].trim();
      }
      if (!institute) {
        const m = extractedText.match(/(college|institute|university)[:\-\s]*([A-Za-z0-9\s\.\&\-]+)/i);
        if (m) institute = m[2].trim();
      }
      if (!percentage) {
        const m = extractedText.match(/(percentage|percent|%|marks)[:\-\s]*([0-9]{1,3}(?:\.[0-9]+)?)/i);
        if (m) percentage = m[2].trim();
      }
    }

    if (!name || !institute || !percentage) return res.status(400).json({ message: 'Could not extract Name/Institute/Percentage. Provide fields or upload clearer marksheet.' });

    const normalized = `${name}|${institute}|${percentage}`.replace(/\s+/g,' ').trim().toLowerCase();
    const normalizedHash = '0x' + sha256Buffer(Buffer.from(normalized));

    // check contract store or AdminRecord
    let exists = await contractService.isDocumentHashStored(normalizedHash);
    if (!exists) {
      const rec = await AdminRecord.findOne({ normalizedHash });
      if (rec) exists = true;
    }

    let matchedRecord = null;
    if (!exists) {
      // try fuzzy match on AdminRecord when exact hash or chain lookup fails
      try {
        const fuzzy = await fuzzyFindAdminRecord(name, institute, percentage, 0.78);
        if (fuzzy && fuzzy.record) {
          matchedRecord = fuzzy.record;
          exists = true;
          // attach score to payload
          try {
            await Notification.create({ type: 'marksheet_fuzzy_match', message: `Fuzzy match for ${name}`, payload: { name, institute, percentage, score: fuzzy.score, matchedId: matchedRecord._id } });
          } catch (nErr) { console.warn('Failed to create notification for fuzzy match', nErr); }
        }
      } catch (fErr) { console.warn('Fuzzy matching failed', fErr); }
    }

    if (!exists) {
      // create notification for admins
      try {
        await Notification.create({ type: 'marksheet_verify_failed', message: `Marksheet verify failed for ${name}`, payload: { name, institute, percentage, normalizedHash } });
      } catch (nErr) { console.warn('Failed to create notification for marksheet fail', nErr); }
      return res.status(404).json({ verified: false, message: 'No matching record found' });
    }

    // match found -> optionally mint SBT if wallet provided
    const walletAddress = req.body.walletAddress || null;
    if (walletAddress) {
      try {
        const resp = await contractService.mintSBT(walletAddress, '', normalizedHash);
        // mark user as verified if exists
        const user = await User.findOne({ walletAddress });
        if (user) { user.isVerified = true; await user.save(); }
        await Notification.create({ type: 'marksheet_verified', message: `Marksheet verified for ${name}`, payload: { name, institute, percentage, walletAddress, resp } });
        return res.json({ verified: true, resp });
      } catch (e) {
        console.error('Marksheet mint error', e);
        return res.status(500).json({ message: 'Mint failed', error: e && e.message ? e.message : String(e) });
      }
    }

    return res.json({ verified: true });
  } catch (err) {
    console.error('Verify marksheet error', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// List notifications (admin only). Supports query params: page, limit, unread=true
router.get('/notifications', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const requester = await User.findById(decoded.id);
    if (!requester || requester.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 25, 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.unread === 'true') filter.read = false;

    const [items, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
    ]);

    res.json({ page, limit, total, items });
  } catch (err) {
    console.error('Error listing notifications', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const requester = await User.findById(decoded.id);
    if (!requester || requester.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });

    const note = await Notification.findById(id);
    if (!note) return res.status(404).json({ message: 'Notification not found' });

    note.read = true;
    await note.save();
    res.json({ success: true, notification: note });
  } catch (err) {
    console.error('Error marking notification read', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin-initiated verification/mint
// Accepts: { adminDocumentId } OR multipart upload with 'documentFile' and walletAddress in body
router.post('/admin/verify-user', upload.single('documentFile'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminUser = await User.findById(decoded.id);
    if (!adminUser || adminUser.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

  const { adminDocumentId, walletAddress, docHash: providedDocHash } = req.body;

    let docHash = null;

    if (adminDocumentId) {
      if (!mongoose.Types.ObjectId.isValid(adminDocumentId)) return res.status(400).json({ message: 'Invalid adminDocumentId' });
      const adm = await require('../models/AdminDocument').findById(adminDocumentId);
      if (!adm) return res.status(404).json({ message: 'AdminDocument not found' });
      docHash = adm.hash;
    } else if (providedDocHash) {
      // docHash provided directly
      docHash = providedDocHash;
    } else if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      docHash = '0x' + sha256Buffer(fileBuffer);
    } else {
      return res.status(400).json({ message: 'Either adminDocumentId or documentFile must be provided' });
    }

    // confirm the docHash exists in store
      let exists = await contractService.isDocumentHashStored(docHash);
      // if binary hash not stored, try textHash based lookup
      let matchedAdminDoc = null;
      if (!exists) {
        // try find admin document by textHash if providedDocHash looks like a text-derived hash length
        if (pdfParse) {
          // compute textHash from providedDocHash only if the incoming was a file -- handled elsewhere
        }
        // try find AdminDocument by hash or textHash
        matchedAdminDoc = await AdminDocument.findOne({ $or: [ { hash: docHash }, { textHash: docHash } ] }).lean();
        if (matchedAdminDoc) exists = true;
      }
      if (!exists) {
      // create notification to alert admin dataset mismatch
      await Notification.create({
        type: 'admin_verify_failed',
        message: `Admin attempted verify but hash not stored`,
        payload: { adminId: adminUser._id, docHash },
      });
      return res.status(404).json({ message: 'Document hash not stored' });
    }

    // need walletAddress to mint
    if (!walletAddress) return res.status(400).json({ message: 'walletAddress is required to mint' });

    try {
      const resp = await contractService.mintSBT(walletAddress, '', docHash);

      // mark user verified if exists
      const user = await User.findOne({ walletAddress });
      if (user) {
        user.isVerified = true;
        await user.save();
      }

      // persist notification about admin-initiated verify
      await Notification.create({
        type: 'admin_verified',
        message: `Admin ${adminUser.email} verified ${walletAddress}`,
        payload: { adminId: adminUser._id, walletAddress, docHash, resp },
      });

      res.json({ success: true, resp });
    } catch (e) {
      console.error('Admin verify/mint error', e);
      res.status(500).json({ message: 'Mint failed', error: e && e.message ? e.message : String(e) });
    }
  } catch (err) {
    console.error('Admin verify route error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: list users (optionally filter by role) for role-specific dashboards
router.get('/admin/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const requester = await User.findById(decoded.id);
    if (!requester || requester.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

    const roleFilter = req.query.role;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const skip = (page - 1) * limit;

    const filter = {};
    if (roleFilter) filter.role = roleFilter;

    const [items, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    res.json({ page, limit, total, items });
  } catch (err) {
    console.error('Error listing users for admin', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List AdminDocuments (admin only) - helpful for UI to select existing dataset entries
router.get('/admin-documents', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const requester = await User.findById(decoded.id);
    if (!requester || requester.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      require('../models/AdminDocument').find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      require('../models/AdminDocument').countDocuments({}),
    ]);

    res.json({ page, limit, total, items });
  } catch (err) {
    console.error('Error listing admin documents', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Alumni: upload a single document to verify against on-chain hashes and mint SBT if matched
router.post('/verify-document', upload.single('documentFile'), async (req, res) => {
  try {
    // alumni provides their walletAddress in body
    const { walletAddress } = req.body;
    if (!walletAddress) return res.status(400).json({ message: 'walletAddress is required' });

    if (!req.file) return res.status(400).json({ message: 'Document file is required' });

    const fileBuffer = fs.readFileSync(req.file.path);
    const hashHex = '0x' + sha256Buffer(fileBuffer);

    let exists = await contractService.isDocumentHashStored(hashHex);
    if (!exists) {
      const textHash = await computeTextHashForFile(req.file.path, req.file.originalname);
      if (textHash) {
        const adm = await AdminDocument.findOne({ textHash });
        if (adm) exists = true;
      }
    }
    if (!exists) {
      // notify admins that a verification attempt failed (possible fraudulent or missing dataset)
      try {
        await Notification.create({
          type: 'verification_attempt_failed',
          message: `Verification attempt failed for wallet ${walletAddress}`,
          payload: { walletAddress, docHash: hashHex },
        });
      } catch (nErr) {
        console.warn('Failed to create failed verification notification', nErr);
      }
      return res.status(404).json({ verified: false, message: 'Document not found' });
    }

    // Mint SBT to walletAddress. tokenUri can be an IPFS URL if available.
    const tokenUri = '';
    try {
      const resp = await contractService.mintSBT(walletAddress, tokenUri, hashHex);

      // If local mode, resp will include local: true
      if (resp && resp.local) {
        // mark user verified locally
        const user = await User.findOne({ walletAddress });
        if (user) {
          user.isVerified = true;
          await user.save();
        }
        // notify admins that a user was verified (local)
        try {
          await Notification.create({
            type: 'verification',
            message: `User ${walletAddress} verified (local mint)`,
            payload: { walletAddress, tokenId: resp.tokenId, docHash: hashHex },
          });
        } catch (nErr) {
          console.warn('Failed to create verification notification', nErr);
        }
        return res.json({ verified: true, mode: 'local', detail: resp });
      }

      // On-chain mode: resp likely contains transaction information
      const txHash = resp && (resp.transactionHash || resp.hash || resp.txHash) ? (resp.transactionHash || resp.hash || resp.txHash) : null;
      const userFound = await User.findOne({ walletAddress });
      if (userFound) {
        userFound.isVerified = true;
        await userFound.save();
      }

      // Notify admins for on-chain verification as well
      try {
        await Notification.create({
          type: 'verification',
          message: `User ${walletAddress} verified (on-chain)`,
          payload: { walletAddress, txHash, docHash: hashHex },
        });
      } catch (nErr) {
        console.warn('Failed to create on-chain verification notification', nErr);
      }

      res.json({ verified: true, mode: 'onchain', txHash, raw: resp });
    } catch (e) {
      console.error('Minting error', e && e.message ? e.message : e);
      res.status(500).json({ message: 'Minting failed', error: e && e.message ? e.message : String(e) });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public (no auth) verification request endpoint
// Accepts multipart: documentFile (required), fields: email (required), walletAddress (required)
router.post('/public/verify-request', upload.single('documentFile'), async (req, res) => {
  try {
  const { email } = req.body;
  const walletAddress = req.body.walletAddress || null;
  if (!email) return res.status(400).json({ message: 'email is required' });
  if (!req.file) return res.status(400).json({ message: 'documentFile is required' });

    const fileBuffer = fs.readFileSync(req.file.path);
    const hashHex = '0x' + sha256Buffer(fileBuffer);

    // First: attempt to extract name/institute/percentage from uploaded file
    let extName = req.body.name || '';
    let extInstitute = req.body.institute || '';
    let extPercentage = req.body.percentage || '';

    try {
      let extractedText = '';
      if (path.extname(req.file.originalname).toLowerCase() === '.pdf' && pdfParse) {
        const data = await pdfParse(fileBuffer);
        extractedText = data.text || '';
      } else if (process.env.ENABLE_OCR === 'true' && tesseract) {
        try {
          const { createWorker } = tesseract;
          const worker = createWorker();
          await worker.load();
          await worker.loadLanguage('eng');
          await worker.initialize('eng');
          const { data: { text } } = await worker.recognize(req.file.path);
          await worker.terminate();
          extractedText = text || '';
        } catch (ocrErr) {
          console.warn('OCR failed during public verify', ocrErr);
        }
      }

      // heuristics to extract fields
      if (!extName) {
        const m = extractedText.match(/name[:\-\s]*([A-Za-z\s\.\,\-\&]+)/i);
        if (m) extName = m[1].trim();
      }
      if (!extInstitute) {
        const m = extractedText.match(/(college|institute|university)[:\-\s]*([A-Za-z0-9\s\.\&\-\,]+)/i);
        if (m) extInstitute = m[2].trim();
      }
      if (!extPercentage) {
        const m = extractedText.match(/(percentage|percent|%|marks)[:\-\s]*([0-9]{1,3}(?:\.[0-9]+)?)/i);
        if (m) extPercentage = m[2].trim();
      }
    } catch (e) {
      console.warn('Failed to extract fields for public verify', e);
    }

    // Normalize extracted fields for comparison
    const nName = (extName || '').replace(/\s+/g,' ').trim().toLowerCase();
    const nInstitute = (extInstitute || '').replace(/\s+/g,' ').trim().toLowerCase();
    const nPercentage = (extPercentage || '').toString().trim();

    // Attempt CSV-based match: find candidate AdminRecords where at least 2 attributes match
    let matchedRecord = null;
    if (nName || nInstitute || nPercentage) {
      // build OR query to fetch candidates
      const orClauses = [];
      if (nName) orClauses.push({ name: { $regex: new RegExp(nName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } });
      if (nInstitute) orClauses.push({ institute: { $regex: new RegExp(nInstitute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } });
      if (nPercentage) orClauses.push({ percentage: nPercentage });

      if (orClauses.length > 0) {
        const candidates = await AdminRecord.find({ $or: orClauses }).limit(500).lean();
        for (const c of candidates) {
          let matchCount = 0;
          if (nName && c.name && c.name.toLowerCase().replace(/\s+/g,' ').includes(nName)) matchCount++;
          if (nInstitute && c.institute && c.institute.toLowerCase().replace(/\s+/g,' ').includes(nInstitute)) matchCount++;
          if (nPercentage && c.percentage && c.percentage.toString().trim() === nPercentage) matchCount++;
          if (matchCount >= 2) { matchedRecord = c; break; }
        }
      }
    }

    // If CSV match found
    if (matchedRecord) {
      try {
        let resp = null;
        let mode = 'no-wallet';
        if (walletAddress) {
          resp = await contractService.mintSBT(walletAddress, '', matchedRecord.normalizedHash);
          mode = resp && resp.local ? 'local' : 'onchain';
        }

        // update user record if exists
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (user) {
          if (walletAddress) user.walletAddress = walletAddress;
          user.isVerified = true;
          user.documentHash = user.documentHash || matchedRecord.normalizedHash;
          await user.save();
        }

        // create admin notification
        try {
          await Notification.create({
            type: 'public_verified',
            message: `Public verification succeeded for ${email} (CSV match)`,
            payload: { email, walletAddress, matchedRecord, resp },
          });
        } catch (nErr) {
          console.warn('Failed to create public_verified notification', nErr);
        }

        return res.json({ verified: true, mode, resp, matchedRecord, extracted: { name: extName, institute: extInstitute, percentage: extPercentage } });
      } catch (e) {
        console.error('Public verify mint error (csv match)', e);
        return res.status(500).json({ message: 'Mint failed', error: e && e.message ? e.message : String(e) });
      }
    }

    // Fallback: existing document hash/textHash based flow
    let exists = await contractService.isDocumentHashStored(hashHex);
    if (!exists) {
      const textHash = await computeTextHashForFile(req.file.path, req.file.originalname);
      if (textHash) {
        const adm = await AdminDocument.findOne({ textHash });
        if (adm) exists = true;
      }
    }
    if (!exists) {
      // notify admins of failed attempt
      try {
        await Notification.create({
          type: 'verification_attempt_failed_public',
          message: `Public verification attempt failed for ${email}`,
          payload: { email, walletAddress, docHash: hashHex, extracted: { name: extName, institute: extInstitute, percentage: extPercentage } },
        });
      } catch (nErr) {
        console.warn('Failed to create notification for failed public verification', nErr);
      }
      return res.status(404).json({ verified: false, message: 'Document not found in admin dataset', extracted: { name: extName, institute: extInstitute, percentage: extPercentage } });
    }

    // Document hash exists in admin store -> proceed to mint and mark user verified if present
    try {
      const resp = await contractService.mintSBT(walletAddress, '', hashHex);

      // update user record if exists
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (user) {
        user.walletAddress = walletAddress;
        user.isVerified = true;
        user.documentHash = user.documentHash || hashHex;
        await user.save();
      }

      // create admin notification
      try {
        await Notification.create({
          type: 'public_verified',
          message: `Public verification succeeded for ${email}`,
          payload: { email, walletAddress, docHash: hashHex, resp },
        });
      } catch (nErr) {
        console.warn('Failed to create public_verified notification', nErr);
      }

      return res.json({ verified: true, mode: resp && resp.local ? 'local' : 'onchain', resp });
    } catch (e) {
      console.error('Public verify mint error', e);
      return res.status(500).json({ message: 'Mint failed', error: e && e.message ? e.message : String(e) });
    }
  } catch (err) {
    console.error('Public verify route error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Lightweight extraction endpoint: uploads a marksheet and returns extracted fields (no verification)
router.post('/extract-fields', upload.single('marksheet'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'marksheet is required' });

    let extractedText = '';
    try {
      const ext = path.extname(req.file.originalname).toLowerCase();
      // Try PDF text extraction when possible
      if (ext === '.pdf' && pdfParse) {
        try {
          const data = await pdfParse(fs.readFileSync(req.file.path));
          extractedText = (data && data.text) ? data.text : '';
        } catch (pdfErr) {
          console.warn('pdf-parse failed for extract-fields', pdfErr);
        }
      }

      // If no text found from PDF and image OCR is available, try OCR as a fallback
      if ((!extractedText || extractedText.trim().length === 0) && tesseract) {
        try {
          // Use OCR even if ENABLE_OCR not explicitly set; prefer OCR when pdf-parse yields nothing
          const { createWorker } = tesseract;
          const worker = createWorker();
          await worker.load();
          await worker.loadLanguage('eng');
          await worker.initialize('eng');
          const { data: { text } } = await worker.recognize(req.file.path);
          await worker.terminate();
          if (text) extractedText = (extractedText || '') + '\n' + text;
        } catch (ocrErr) {
          console.warn('OCR failed during extract-fields', ocrErr);
        }
      }
    } catch (e) {
      console.warn('extract-fields: text extraction failed', e);
    }

    // heuristics
    let name = '';
    let institute = '';
    let percentage = '';

  console.log('[extract-fields] uploaded file:', req.file.path, 'size:', req.file.size);
  if (extractedText) {
      // try labeled regexes first
      const m1 = extractedText.match(/name[:\-\s]*([A-Za-z\s\.\,\-\&]+)/i);
      if (m1) name = m1[1].trim();
      const m2 = extractedText.match(/(college|institute|university)[:\-\s]*([A-Za-z0-9\s\.\&\-\,]+)/i);
      if (m2) institute = m2[2].trim();
      const m3 = extractedText.match(/(percentage|percent|%|marks)[:\-\s]*([0-9]{1,3}(?:\.[0-9]+)?)/i);
      if (m3) percentage = m3[2].trim();

      // if labeled regexes failed, do a line-by-line scan for likely candidates
      if ((!name || !institute || !percentage)) {
        const lines = extractedText.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
        for (const line of lines) {
          // look for percentage-like content
          if (!percentage) {
            const p = line.match(/([0-9]{1,3}(?:\.[0-9]+)?)\s*%/);
            if (p) { percentage = p[1].trim(); continue; }
            const p2 = line.match(/percentage[:\-\s]*([0-9]{1,3}(?:\.[0-9]+)?)/i);
            if (p2) { percentage = p2[1].trim(); continue; }
          }
          // look for institute keywords
          if (!institute) {
            if (/(college|institute|university|school|dept|department)/i.test(line)) {
              // remove inline labels
              const inst = line.replace(/(college|institute|university|school|dept|department)[:\-\s]*/i, '').trim();
              if (inst.length > 3 && inst.length < 200) { institute = inst; continue; }
            }
          }
          // look for name heuristics: capitalised words, not too long
          if (!name) {
            // skip lines that look like headings
            if (/^(marksheet|marklist|result|certificate)/i.test(line)) continue;
            const nameCand = line.replace(/[^A-Za-z\s\.\,\-\&]/g,'').trim();
            const words = nameCand.split(/\s+/).filter(Boolean);
            if (words.length >= 2 && words.length <= 6 && /^[A-Z][a-z]/.test(words[0])) {
              name = nameCand;
              continue;
            }
          }
        }
      }
    }

    // If nothing could be extracted, provide helpful diagnostics
    if ((!extractedText || extractedText.trim().length === 0) || (!name && !institute && !percentage)) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const diagnostics = {
        pdfParseAvailable: !!pdfParse,
        tesseractAvailable: !!tesseract,
        enableOcrEnv: process.env.ENABLE_OCR === 'true',
        fileExt: ext,
        fileSize: req.file.size,
      };
      return res.json({ extracted: { name, institute, percentage }, rawText: extractedText || '', diagnostic: diagnostics, message: 'No clear fields extracted. If you uploaded an image, enable OCR (ENABLE_OCR=true) and install tesseract.js, or upload a searchable PDF.' });
    }

    return res.json({ extracted: { name, institute, percentage }, rawText: extractedText.slice(0, 5000) });
  } catch (err) {
    console.error('extract-fields error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Debug route to list uploaded files
router.get("/debug-files", (req, res) => {
  try {
    const documentsDir = path.join(__dirname, '../uploads/documents');
    const profilesDir = path.join(__dirname, '../uploads/profiles');
    
    let result = {
      documentsDir: documentsDir,
      profilesDir: profilesDir,
      documentsExists: fs.existsSync(documentsDir),
      profilesExists: fs.existsSync(profilesDir),
      documents: [],
      profiles: []
    };
    
    if (fs.existsSync(documentsDir)) {
      result.documents = fs.readdirSync(documentsDir);
    }
    
    if (fs.existsSync(profilesDir)) {
      result.profiles = fs.readdirSync(profilesDir);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve uploaded files
router.get("/file/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    
    console.log('Attempting to serve file:', filename);
    console.log('Current directory:', __dirname);
    
    // Check both documents and profiles directories
    const documentPath = path.join(__dirname, '../uploads/documents', filename);
    const profilePath = path.join(__dirname, '../uploads/profiles', filename);
    
    console.log('Checking document path:', documentPath);
    console.log('Checking profile path:', profilePath);
    
    let filePath = null;
    
    if (fs.existsSync(documentPath)) {
      filePath = documentPath;
      console.log('Found file in documents directory');
    } else if (fs.existsSync(profilePath)) {
      filePath = profilePath;
      console.log('Found file in profiles directory');
    }
    
    if (!filePath) {
      console.log('File not found in either directory');
      console.log('Available files in documents:');
      try {
        const documentsDir = path.join(__dirname, '../uploads/documents');
        if (fs.existsSync(documentsDir)) {
          const files = fs.readdirSync(documentsDir);
          console.log(files);
        } else {
          console.log('Documents directory does not exist');
        }
      } catch (e) {
        console.log('Error reading documents directory:', e.message);
      }
      
      return res.status(404).json({ message: "File not found" });
    }
    
    // Set appropriate headers based on file type
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    // Send the file
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ message: "Error serving file" });
  }
});

// Serve Document Route - Alternative viewing method
router.get("/document/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (!user.documentLink) {
      return res.status(404).json({ message: "No document found" });
    }
    
    // Redirect to the Cloudinary URL
    res.redirect(user.documentLink);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Debug Route - Get current user's document info
router.get("/debug-document", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      userId: user._id,
      documentLink: user.documentLink,
      profileUrl: user.profileUrl,
      hasDocument: !!user.documentLink,
      documentLinkLength: user.documentLink ? user.documentLink.length : 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Validate Document URL Route
router.get("/validate-document/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (!user.documentLink) {
      return res.status(404).json({ message: "No document found" });
    }
    
    // Test if the URL is accessible
    try {
      const response = await fetch(user.documentLink, { method: 'HEAD' });
      if (response.ok) {
        res.json({ 
          valid: true, 
          url: user.documentLink,
          contentType: response.headers.get('content-type')
        });
      } else {
        res.status(400).json({ 
          valid: false, 
          message: "Document URL is not accessible",
          status: response.status
        });
      }
    } catch (fetchError) {
      console.error("Error validating document URL:", fetchError);
      res.status(400).json({ 
        valid: false, 
        message: "Unable to validate document URL" 
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
