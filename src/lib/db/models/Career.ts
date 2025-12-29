import mongoose from 'mongoose';

const CareerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  alternativeTitles: [String],
  industryId: String,
  description: String,
  responsibilities: [String],
  salaryData: {
    currency: { type: String, default: 'USD' },
    entryLevel: { min: Number, max: Number },
    midLevel: { min: Number, max: Number },
    seniorLevel: { min: Number, max: Number }
  },
  growthOutlook: {
    type: String,
    enum: ['Declining', 'Stable', 'Growing', 'High Growth']
  },
  demandScore: Number, // 0-100
  createdAt: { type: Date, default: Date.now }
});

export const Career = mongoose.models.Career || 
  mongoose.model('Career', CareerSchema);
