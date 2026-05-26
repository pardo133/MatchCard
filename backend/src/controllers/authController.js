import jwt    from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/user.model.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../services/emailService.js';

/* ── Helpers ──────────────────────────────────────────────── */
function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function randomToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Reglas: mín. 8 chars, 1 mayúscula, 1 símbolo
function validatePassword(password) {
  if (!password || password.length < 8)
    return 'La contraseña debe tener al menos 8 caracteres';
  if (!/[A-Z]/.test(password))
    return 'La contraseña debe contener al menos una letra mayúscula';
  if (!/[!@#$%^&*()\-_=+[\]{};:'"\\|,.<>/?`~]/.test(password))
    return 'La contraseña debe contener al menos un símbolo especial';
  return null;
}

/* ── Register ─────────────────────────────────────────────── */
export async function register(req, res, next) {
  try {
    const { username, email, password, ciudad, telefono } = req.body;

    // Validar contraseña
    const passError = validatePassword(password);
    if (passError) return res.status(400).json({ message: passError });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(409).json({ message: 'Email o username ya registrado' });
    }

    const emailVerifyToken = randomToken();

    const user = await User.create({
      username,
      email,
      passwordHash:     password,
      ciudad,
      telefono:         telefono?.trim() || '',
      emailVerifyToken,
      isEmailVerified:  false,
      inventario: { repetidos: [], faltas: [] },
    });

    // Enviar correo de verificación (no bloqueante)
    sendVerificationEmail(email, emailVerifyToken).catch(err =>
      console.error('[email] verify send failed:', err.message)
    );

    // Devolvemos token para que puedan navegar, pero verán el aviso de verificación
    res.status(201).json({ token: generateToken(user._id), user });
  } catch (error) {
    next(error);
  }
}

/* ── Login ────────────────────────────────────────────────── */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // TODO: reactivar verificación de email cuando SMTP esté configurado
    // if (!user.isEmailVerified) {
    //   return res.status(403).json({
    //     message: 'Debes verificar tu email antes de iniciar sesión',
    //     needsVerification: true,
    //     email: user.email,
    //   });
    // }

    res.json({ token: generateToken(user._id), user });
  } catch (error) {
    next(error);
  }
}

/* ── GetMe ────────────────────────────────────────────────── */
export async function getMe(req, res) {
  res.json({ user: req.user });
}

/* ── Verificar email ──────────────────────────────────────── */
export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.params;

    const user = await User.findOne({ emailVerifyToken: token }).select('+emailVerifyToken');
    if (!user) {
      return res.status(400).json({ message: 'Enlace inválido o ya utilizado' });
    }

    user.isEmailVerified  = true;
    user.emailVerifyToken = undefined;
    await user.save();

    res.json({ message: 'Email verificado correctamente. ¡Ya puedes iniciar sesión!' });
  } catch (error) {
    next(error);
  }
}

/* ── Reenviar verificación ────────────────────────────────── */
export async function resendVerification(req, res, next) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select('+emailVerifyToken');
    if (!user) return res.json({ message: 'Si ese email existe, recibirás el enlace en breve' });
    if (user.isEmailVerified) return res.json({ message: 'Tu email ya está verificado' });

    const token = randomToken();
    user.emailVerifyToken = token;
    await user.save();

    await sendVerificationEmail(user.email, token);
    res.json({ message: 'Correo de verificación reenviado' });
  } catch (error) {
    next(error);
  }
}

/* ── Forgot password ──────────────────────────────────────── */
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'Si ese email existe, recibirás instrucciones en breve' });
    }

    const token   = randomToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    user.passwordResetToken   = token;
    user.passwordResetExpires = expires;
    await user.save();

    await sendPasswordResetEmail(email, token);
    res.json({ message: 'Si ese email existe, recibirás instrucciones en breve' });
  } catch (error) {
    next(error);
  }
}

/* ── Reset password ───────────────────────────────────────── */
export async function resetPassword(req, res, next) {
  try {
    const { token }    = req.params;
    const { password } = req.body;

    const passError = validatePassword(password);
    if (passError) return res.status(400).json({ message: passError });

    const user = await User.findOne({
      passwordResetToken:   token,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({ message: 'El enlace ha caducado o no es válido' });
    }

    user.passwordHash         = password;
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    next(error);
  }
}
