import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isHR: { type: Boolean, default: false },

  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  preferredName: { type: String },
  address: {
    street: { type: String, required: true },
    unit: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
  },
  cellPhone: { type: String, required: true },
  workPhone: { type: String },
  ssn: { type: String, required: true },
  dateOfBirth: {
    type: Date,
    required: true,
    validate: {
      validator: (value) => value < new Date(),
      message: 'Date of birth must be in the past'
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'I do not wish to answer'],
    required: true
  },

  // Citizenship and work authorization
  citizenshipStatus: {
    type: String,
    enum: ['citizen', 'permanent_resident', 'work_visa'],
    required: true
  },
  workAuthorizationType: {
    type: String,
    enum: ['H1-B', 'L2', 'F1(CPT/OPT)', 'H4', 'Other'],
    required: function () {
      return this.citizenshipStatus === 'work_visa';
    }
  },
  visaTitle: {
    type: String,
    required: function () {
      return this.workAuthorizationType === 'Other';
    }
  },
  visaStartDate: {
    type: Date,
    required: function () {
      return this.citizenshipStatus === 'work_visa';
    }
  },
  visaEndDate: {
    type: Date,
    required: function () {
      return this.citizenshipStatus === 'work_visa';
    }
  },

  // Reference (1 only)
  reference: {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    relationship: { type: String, required: true }
  },

  // Emergency contacts (1+)
  emergencyContacts: [{
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    relationship: { type: String, required: true }
  }],

  documents: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Document' }
  ],

onboardingReview: {
  status: {
    type: String,
    enum: ['never_submitted', 'pending', 'approved', 'rejected'],
    default: 'never_submitted'
  },
  hrFeedback: { type: String }
}

}, { timestamps: true });

export const Employee = mongoose.model('Employee', employeeSchema);
