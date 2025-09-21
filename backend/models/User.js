const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    universityName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["student", "alumni", "employer"],
      required: true,
    },
    email: {
         type: String, 
         required: true,
          unique: true, 
          lowercase: true, 
          trim: true 
        },
    password: { type: String, required: true },
    contactNumber: { type: String, required: true },
    documentLink: { type: String, required: true },
    profileUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    graduationYear: { type: String }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
