import { User } from '../models/user.model.js';

export async function findMatchesForUser(userAId) {
  const userA = await User.findById(userAId)
    .select('ciudad inventario')
    .lean();

  if (!userA) throw new Error('Usuario no encontrado');

  const { ciudad, inventario: { repetidos: repA, faltas: faltasA } } = userA;

  if (!repA.length || !faltasA.length) return [];

  const repASet    = new Set(repA.map(id => id.toString()));
  const faltasASet = new Set(faltasA.map(id => id.toString()));

  const candidatos = await User.find({
    _id:      { $ne: userAId },
    ciudad,
    isActive: true,
    'inventario.repetidos': { $in: faltasA },
  })
    .select('username inventario')
    .lean();

  const matches = [];

  for (const userB of candidatos) {
    const repB    = userB.inventario.repetidos.map(id => id.toString());
    const faltasB = userB.inventario.faltas.map(id => id.toString());

    const cromosDeBparaA = repB.filter(id => faltasASet.has(id));
    const faltasBSet     = new Set(faltasB);
    const cromosDeAparaB = [...repASet].filter(id => faltasBSet.has(id));

    if (cromosDeBparaA.length > 0 && cromosDeAparaB.length > 0) {
      matches.push({
        userB:           userB._id,
        userBUsername:   userB.username,
        cromosDeAparaB,
        cromosDeBparaA,
        score: cromosDeAparaB.length + cromosDeBparaA.length,
      });
    }
  }

  return matches.sort((a, b) => b.score - a.score);
}
