import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['USER', 'HANDYMAN'], required: true },
  location: {
    city: { type: String },
    lat: { type: Number },
    lng: { type: Number },
  },
  // Handyman-specific fields (optional for USER role)
  skills: { type: [String] },
  hourlyRate: { type: Number },
  experienceYears: { type: Number },
  availability: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  totalJobs: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
}, {
  // Ensure we're using the harhall database
  collection: 'users',
});

// Drop any old indexes that might cause issues
userSchema.index({ email: 1 }, { unique: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);