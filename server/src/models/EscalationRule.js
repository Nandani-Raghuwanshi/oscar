import mongoose from 'mongoose';

const escalationStageSchema = new mongoose.Schema({
    stageNumber: {
        type: Number,
        required: true,
        min: 1
    },
    waitHours: {
        type: Number,
        required: true,
        min: 1
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
    },
    actionType: {
        type: String,
        required: true,
        enum: ['escalate_to_manager', 'escalate_to_builder', 'auto_close', 'send_notification']
    },
    targetStatus: {
        type: String,
        enum: ['new', 'contacted', 'site_visit', 'qualified', 'negotiating', 'proposal_sent', 'converted', 'lost']
    },
    lostReason: String,
    notifyRoles: {
        type: [String],
        enum: ['crm_manager', 'sales_associate', 'builder', 'admin'],
        default: []
    },
    kpiField: String,
    notificationTemplate: String
}, { _id: false });

const escalationRuleSchema = new mongoose.Schema({
    ruleName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    
    // Trigger Conditions
    sourceStatus: {
        type: String,
        required: true,
        enum: ['new', 'contacted', 'site_visit', 'qualified', 'negotiating', 'proposal_sent', 'converted', 'lost'],
        index: true
    },
    targetStatus: {
        type: String,
        enum: ['new', 'contacted', 'site_visit', 'qualified', 'negotiating', 'proposal_sent', 'converted', 'lost']
    },
    
    // Rule Configuration
    enabled: {
        type: Boolean,
        default: true,
        index: true
    },
    stages: {
        type: [escalationStageSchema],
        required: true,
        validate: {
            validator: function(stages) {
                return stages && stages.length > 0;
            },
            message: 'At least one escalation stage is required'
        }
    },
    
    // Applicability
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    
    // Metadata
    version: {
        type: Number,
        default: 1
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes
escalationRuleSchema.index({ enabled: 1, sourceStatus: 1 });
escalationRuleSchema.index({ projectId: 1, enabled: 1 });

// Virtual for max wait hours
escalationRuleSchema.virtual('maxWaitHours').get(function() {
    if (!this.stages || this.stages.length === 0) return 0;
    return Math.max(...this.stages.map(s => s.waitHours));
});

const EscalationRule = mongoose.model('EscalationRule', escalationRuleSchema);
export default EscalationRule;
