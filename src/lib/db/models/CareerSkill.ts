import mongoose from 'mongoose';

const CareerSkillSchema = new mongoose.Schema({
    careerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Career',
        required: true,
        unique: true
    },
    requiredSkills: [{
        skillId: mongoose.Schema.Types.ObjectId,
        skillName: String,
        importance: {
            type: String,
            enum: ['Critical', 'Important', 'Nice-to-have']
        },
        minimumProficiency: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
        },
        weight: Number // 1-10 for matching algorithm
    }],
    updatedAt: { type: Date, default: Date.now }
});

// Index for faster career lookups
CareerSkillSchema.index({ careerId: 1 });

export const CareerSkill = mongoose.models.CareerSkill ||
    mongoose.model('CareerSkill', CareerSkillSchema);
