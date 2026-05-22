import { User }  from '../models/user.model.js';
import { Cromo } from '../models/cromo.model.js';
import { Match } from '../models/match.model.js';

export async function getStats(req, res, next) {
  try {
    const [usuarios, cromos, matches] = await Promise.all([
      User.countDocuments(),
      Cromo.countDocuments(),
      Match.countDocuments(),
    ]);

    const ciudadesResult = await User.distinct('ciudad');

    res.json({ usuarios, cromos, matches, ciudades: ciudadesResult.length });
  } catch (error) {
    next(error);
  }
}
