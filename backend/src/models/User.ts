import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface UserDocument extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  comparePassword(password: string): Promise<boolean>;
  _id: mongoose.Types.ObjectId;
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function(password: string) {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model<UserDocument>('User', userSchema); 