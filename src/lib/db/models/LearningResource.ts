import mongoose from 'mongoose';

const LearningResourceSchema = new mongoose.Schema({
    skillId: mongoose.Schema.Types.ObjectId,
    skillName: String,
    title: String,
    provider: {
        type: String,
        enum: ['Coursera', 'Udemy', 'YouTube', 'freeCodeCamp', 'edX', 'LinkedIn Learning']
    },
    url: String,
    type: {
        type: String,
        enum: ['Course', 'Video', 'Tutorial', 'Article', 'Book']
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced']
    },
    duration: String, // "4 weeks", "10 hours"
    cost: {
        isFree: Boolean,
        amount: Number
    },
    rating: Number, // 0-5
    reviewCount: Number
});

// Compound index for faster skill-based queries with rating sort
LearningResourceSchema.index({ skillName: 1, rating: -1 });
LearningResourceSchema.index({ skillName: 1, reviewCount: -1 });

export const LearningResource = mongoose.models.LearningResource ||
    mongoose.model('LearningResource', LearningResourceSchema);
