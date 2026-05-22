import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    userA: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userB: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cromosDeAparaB: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cromo' }],
    cromosDeBparaA: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cromo' }],
    ciudad: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const Match = mongoose.model('Match', matchSchema);
