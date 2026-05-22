import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema.Types;

const mensajeSchema = new mongoose.Schema({
  autor:     { type: ObjectId, ref: 'User', required: true },
  texto:     { type: String,  required: true, trim: true },
  timestamp: { type: Date,    default: Date.now },
}, { _id: true });

const matchSchema = new mongoose.Schema(
  {
    userA: { type: ObjectId, ref: 'User', required: true },
    userB: { type: ObjectId, ref: 'User', required: true },

    cromosDeAparaB: [{ type: ObjectId, ref: 'Cromo' }],
    cromosDeBparaA: [{ type: ObjectId, ref: 'Cromo' }],

    ciudad:      { type: String },
    distanciaKm: { type: Number },
    prioridad:   { type: String, enum: ['zona', 'provincial', 'internacional'], default: 'internacional' },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },

    // Chat embebido
    mensajes: [mensajeSchema],

    // Confirmaciones del intercambio físico
    confirmaciones: {
      userA: { type: Boolean, default: false },
      userB: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const Match = mongoose.model('Match', matchSchema);
