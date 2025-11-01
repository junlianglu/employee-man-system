import mongoose from 'mongoose';

const registrationTokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  registrationLink: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  submittedAt: { type: Date },
}, { timestamps: true });

export const RegistrationToken = mongoose.model('RegistrationToken', registrationTokenSchema);
