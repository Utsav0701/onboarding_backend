import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'staff'],
    default: 'admin',
  }
});

export default mongoose.model('Admin', adminSchema);
