const BADGES = {
  first_match:      { icon: '⚡', label: 'Primer Match',     color: 'text-pokemon-yellow border-pokemon-yellow/30 bg-pokemon-yellow/10' },
  collector_10:     { icon: '📦', label: 'Coleccionista',    color: 'text-pokemon-blue border-pokemon-blue/30 bg-pokemon-blue/10' },
  completed_album:  { icon: '🏆', label: 'Álbum Completo',   color: 'text-amber-400 border-amber-400/30 bg-amber-400/10' },
  social_butterfly: { icon: '🤝', label: 'Intercambiador',   color: 'text-green-400 border-green-400/30 bg-green-400/10' },
};

export default function BadgeList({ earnedBadges = [] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(BADGES).map(([key, { icon, label, color }]) => {
        const earned = earnedBadges.includes(key);
        return (
          <div
            key={key}
            title={earned ? label : `Bloqueado: ${label}`}
            className={`badge border transition-all duration-300 ${
              earned
                ? `${color} animate-badge-pop cursor-default`
                : 'text-gray-600 border-gray-700 bg-gray-900/50 grayscale cursor-not-allowed'
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
