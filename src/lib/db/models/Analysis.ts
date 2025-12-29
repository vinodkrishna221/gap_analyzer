import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetCareerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Career'
    },
    targetCareerName: String,
    analysisDate: { type: Date, default: Date.now },
    results: {
        matchScore: Number,
        matchingSkills: [{
            skillName: String,
            userProficiency: String,
            requiredProficiency: String
        }],
        missingSkills: [{
            skillName: String,
            importance: String,
            requiredProficiency: String
        }],
        partialSkills: [{
            skillName: String,
            userProficiency: String,
            requiredProficiency: String,
            gap: String
        }]
    },
    aiInsights: String
});

export const Analysis = mongoose.models.Analysis ||
    mongoose.model('Analysis', AnalysisSchema);
