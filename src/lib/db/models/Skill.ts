import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        enum: ['Technical', 'Soft Skills', 'Tools', 'Domain Knowledge']
    },
    subcategory: String,
    description: String,
    demandScore: Number // 0-100, for sorting popular skills
});

export const Skill = mongoose.models.Skill ||
    mongoose.model('Skill', SkillSchema);
