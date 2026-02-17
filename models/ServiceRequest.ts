import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  handymanId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceType: { type: String, required: true },
  description: { type: String, required: true },
  priceAgreed: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'], default: 'PENDING' },
  paymentStatus: { type: String, enum: ['UNPAID', 'PAID'], default: 'UNPAID' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ServiceRequest || mongoose.model('ServiceRequest', serviceRequestSchema);