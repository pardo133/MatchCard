import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username:     { type: String, required: true, unique: true, trim: true, minlength: 3 },
    email:        { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    ciudad:       { type: String, required: true, trim: true, index: true },
    telefono:     { type: String, trim: true, default: '' },

    isAdmin:  { type: Boolean, default: false },
    isActive: { type: Boolean, default: true  },

    // Email verification
    isEmailVerified:  { type: Boolean, default: false },
    emailVerifyToken: { type: String, select: false },

    // Password reset
    passwordResetToken:   { type: String, select: false },
    passwordResetExpires: { type: Date,   select: false },

    // Monetización: premium via Stripe
    isPremium:        { type: Boolean, default: false },
    stripeCustomerId: { type: String,  default: '' },

    // Límite diario para usuarios gratuitos
    searchesToday:  { type: Number, default: 0 },
    lastSearchDate: { type: String, default: '' }, // 'YYYY-MM-DD'

    inventario: {
      repetidos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cromo' }],
      faltas:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cromo' }],
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.emailVerifyToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

export const User = mongoose.model('User', userSchema);
