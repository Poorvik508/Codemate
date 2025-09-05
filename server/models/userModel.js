import mongoose from "mongoose";

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
    skills: { type: [String], default: [] },        // e.g. ["#C++", "#React"]
    location: { type: String, default: '' },        // City/region
    availability: { type: String, default: '' },    // Weekends/Evenings
    college: { type: String, default: '' },         // ✅ optional, used for filtering
    bio: { type: String, default: '' },             
    

    // Matching support (AI vectors)
    embedding: { type: [Number], default: [] },

    // System fields
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true }); // auto-manages createdAt & updatedAt

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;

