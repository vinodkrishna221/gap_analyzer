import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    profile: {
        name: string;
        education?: {
            level: string;
            institution: string;
            fieldOfStudy: string;
            graduationYear: number;
        };
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        profile: {
            name: { type: String, required: true },
            education: {
                level: String,
                institution: String,
                fieldOfStudy: String,
                graduationYear: Number,
            },
        },
    },
    {
        timestamps: true,
    }
);

export const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
