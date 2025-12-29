import mongoose from 'mongoose';

const CareerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    salaryRange: String,
    outlook: String, // "Growing", "Stable", "Declining"
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const Career = mongoose.models.Career ||
    mongoose.model('Career', CareerSchema);
