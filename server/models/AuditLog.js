/**
 * AuditLog Model
 * Security audit trail for tracking system actions.
 */
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true,
    enum: {
      values: [
        'login', 'logout', 'register', 'password_change', 'password_reset',
        'profile_update', 'role_change', 'account_deactivate', 'account_activate',
        'course_create', 'course_update', 'course_delete', 'course_publish',
        'course_approve', 'course_reject', 'enrollment_create', 'enrollment_drop',
        'grade_assignment', 'certificate_generate', 'certificate_revoke',
        'mentor_assign', 'admin_action', 'api_key_access'
      ],
      message: '{VALUE} is not a valid audit action'
    },
    trim: true
  },
  resource: {
    type: String,
    trim: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ip: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  method: {
    type: String,
    trim: true
  },
  endpoint: {
    type: String,
    trim: true
  },
  statusCode: {
    type: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ createdAt: -1 });

// Statics
auditLogSchema.statics.log = async function(data) {
  return this.create(data);
};

auditLogSchema.statics.findByUser = function(userId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

auditLogSchema.statics.findByAction = function(action, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  return this.find({ action })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

auditLogSchema.statics.findByResource = function(resource, resourceId) {
  return this.find({ resource, resourceId })
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
