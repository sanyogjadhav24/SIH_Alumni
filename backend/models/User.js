const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    universityName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["student", "alumni", "employer", "admin"],
      required: true,
    },
    walletAddress: { type: String },
    email: {
         type: String, 
         required: true,
          unique: true, 
          lowercase: true, 
          trim: true 
        },
    password: { type: String, required: true },
    contactNumber: { type: String, required: true },
    documentLink: { type: String},
  documentHash: { type: String },
    profileUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    graduationYear: { type: String },
    profileViews: { type: Number, default: 0 },
    connectionRequests: [{
      from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
      createdAt: { type: Date, default: Date.now }
    }],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
