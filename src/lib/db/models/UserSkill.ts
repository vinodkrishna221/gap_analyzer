import mongoose from 'mongoose';

const UserSkillSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    skills: [{
        skillId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Skill'
        },
        skillName: String, // Denormalized for quick access
        proficiencyLevel: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
        },
        proficiencyScore: {
            type: Number,
            min: 0,
            max: 100
        },
        addedDate: { type: Date, default: Date.now }
    }],
    interests: [String], // ["Web Development", "AI", "Data Science"]
    updatedAt: { type: Date, default: Date.now }
});

// Index for faster user lookups
UserSkillSchema.index({ userId: 1 });

export const UserSkill = mongoose.models.UserSkill ||
    mongoose.model('UserSkill', UserSkillSchema);
