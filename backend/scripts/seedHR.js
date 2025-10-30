// backend/scripts/seedHR.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { Employee } from '../models/Employee.js';
import { hashPassword } from '../utils/hashPassword.js';

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI in environment.');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const username = 'hr1';
  const email = 'hr1@gmail.com';
  const plainPassword = 'hr@gmail.com';

  const existing = await Employee.findOne({ $or: [{ username }, { email }] });
  if (existing) {
    if (!existing.isHR) {
      existing.isHR = true;
      await existing.save();
      console.log(`Existing user updated to HR: ${existing.username}`);
    } else {
      console.log(`HR user already exists: ${existing.username}`);
    }
    await mongoose.disconnect();
    process.exit(0);
  }

  const password = await hashPassword(plainPassword);

  const doc = await Employee.create({
    email,
    username,
    password,
    isHR: true,

    firstName: 'HR',
    middleName: '',
    lastName: 'Admin',
    preferredName: 'HR Admin',
    address: {
      street: '1 Main St',
      unit: '',
      city: 'Anytown',
      state: 'CA',
      zip: '90001',
    },
    cellPhone: '555-000-0000',
    workPhone: '555-000-0001',
    ssn: '123-45-6789',
    dateOfBirth: new Date('1980-01-01'),
    gender: 'I do not wish to answer',

    citizenshipStatus: 'citizen',

    reference: {
      firstName: 'Ref',
      middleName: '',
      lastName: 'Person',
      phone: '555-111-2222',
      email: 'ref@example.com',
      relationship: 'Manager',
    },

    emergencyContacts: [
      {
        firstName: 'Emer',
        middleName: '',
        lastName: 'Gency',
        phone: '555-222-3333',
        email: 'emer@example.com',
        relationship: 'Spouse',
      },
    ],

    onboardingReview: {
      status: 'approved',
      hrFeedback: '',
    },
  });

  console.log('HR user created:');
  console.log({ username, email, password: plainPassword });
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});