import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
    email:    { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    ciudad:   { type: String, required: true, trim: true, index: true },

    // GeoJSON para matchmaking por proximidad
    ubicacion: {
      type:        { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: undefined }, // [longitud, latitud]
    },

    isAdmin:  { type: Boolean, default: false },
    isActive: { type: Boolean, default: true  },

    inventario: {
      repetidos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cromo' }],
      faltas:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cromo' }],
    },
  },
  { timestamps: true }
);

// Índice geoespacial sparse (solo indexa docs con ubicacion)
userSchema.index({ ubicacion: '2dsphere' }, { sparse: true });

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
  return obj;
};

export const User = mongoose.model('User', userSchema);
