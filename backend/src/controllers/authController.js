import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export async function register(req, res, next) {
  try {
    const { username, email, password, ciudad } = req.body;

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(409).json({ message: 'Email o username ya registrado' });
    }

    const user = await User.create({
      username,
      email,
      passwordHash: password,
      ciudad,
      inventario: { repetidos: [], faltas: [] },
    });

    res.status(201).json({ token: generateToken(user._id), user });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    res.json({ token: generateToken(user._id), user });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res) {
  res.json({ user: req.user });
}
