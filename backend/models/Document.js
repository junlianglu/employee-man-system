import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  type: {
    type: String,
    enum: [
      'profile_picture', 'drivers_license', 'work_authorization',
      'opt_receipt', 'opt_ead', 'i983', 'i20'
    ],
    required: true
  },
  fileName: { type: String },
  fileUrl: { type: String },
  status: {
    type: String,
    enum: ['not_uploaded', 'pending', 'approved', 'rejected'],
    default: 'not_uploaded'
  },
  hrFeedback: { type: String },
  reviewedAt: { type: Date }
}, { timestamps: true });

export const Document = mongoose.model('Document', documentSchema);
