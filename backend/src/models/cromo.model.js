import mongoose from 'mongoose';

const cromoSchema = new mongoose.Schema(
  {
    numero: {
      type: Number,
      required: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    expansion: {
      type: String,
      required: true,
      trim: true,
    },
    imagenUrl: {
      type: String,
      default: '',
    },
    rareza: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'ultra-rare', 'secret-rare'],
      default: 'common',
    },
    categoria: {
      type: String,
      enum: ['Pokémon', 'Deportes', 'Anime', 'Otros'],
      default: 'Otros',
      index: true,
    },
  },
  { timestamps: true }
);

cromoSchema.index({ numero: 1, expansion: 1 }, { unique: true });
cromoSchema.index({ nombre: 1, categoria: 1 });

export const Cromo = mongoose.model('Cromo', cromoSchema);
