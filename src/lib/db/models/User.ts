import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    profile: {
        name: { type: String, required: true },
        education: {
            level: String, // "High School", "Bachelor's", "Master's", "PhD"
            institution: String,
            fieldOfStudy: String,
            graduationYear: Number
        }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
