import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        builder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'completed'],
            default: 'active'
        },
        location: {
            type: String,
            trim: true
        },
        documentation: {
            type: String,
            trim: true
        },
        certifications: [{
            name: String,
            url: String,
            uploadedAt: Date
        }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Project', projectSchema);
