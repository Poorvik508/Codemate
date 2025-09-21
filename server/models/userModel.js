import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vector: { type: [Number], required: true },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Account verification
  verifyOtp: { type: String, default: '' },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: '' },
  resetOtpExpireAt: { type: Number, default: 0 },

  // Profile fields
  skills: [skillSchema], // Array of skill objects
  location: { type: String, default: '' },
  availability: { type: String, default: '' },
  college: { type: String, default: '' },
  bio: { type: String, default: '' },
  profilePic: { type: String, default: '' }, // Added profilePic field

  // Matching support (AI vectors)
  embedding: { type: [Number], default: [] }, // This field can be used for a combined embedding of all skills

  // System fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;