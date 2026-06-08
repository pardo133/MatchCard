import multer from 'multer';
import { uploadToSirv } from '../services/sirvService.js';

// Multer guarda el archivo en RAM (buffer) — Sirv recibe el binario directamente
export const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|jpg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes (jpg, png, webp, gif)'));
  },
});

export async function uploadCardPhoto(req, res) {
  if (!req.file) return res.status(400).json({ message: 'No se recibió ningún archivo' });

  try {
    const url = await uploadToSirv(req.file.buffer, req.file.mimetype, req.file.originalname);
    res.json({ url });
  } catch (err) {
    console.error('[Sirv]', err.message);
    res.status(500).json({ message: 'Error al subir la imagen' });
  }
}
