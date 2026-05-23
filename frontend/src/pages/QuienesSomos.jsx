import { Link } from 'react-router-dom';

const EQUIPO = [
  {
    nombre: 'Carlos Ruiz Pardo',
    rol: 'Fundador & Desarrollador Web',
    emoji: '👨‍💻',
    desc: 'Coleccionista y desarrollador web. Creó MatchCard para resolver un problema real: demasiados duplicados y ninguna forma sencilla de intercambiarlos con otros coleccionistas.',
  },
];

export default function QuienesSomos() {
  return (
    <div className="min-h-screen" style={{ background: '#fff' }}>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f0e1a 0%, #1e1b4b 50%, #3730a3 100%)',
        paddingTop: '5rem',
        paddingBottom: '5rem',
      }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8"
                style={{ color: '#a5b4fc', background: 'rgba(165,180,252,0.12)', border: '1px solid rgba(165,180,252,0.2)' }}>
            ✦ Nuestra historia
          </span>
          <h1 className="font-black text-white leading-tight mb-6"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', letterSpacing: '-0.03em' }}>
            Somos coleccionistas.
            <br />
            <span style={{ color: '#FFD700' }}>Como tú.</span>
          </h1>
          <p className="leading-relaxed max-w-xl mx-auto"
             style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.72)' }}>
            MatchCard nació de una frustración muy concreta: montones de cromos duplicados
            acumulando polvo en cajones, mientras en el álbum siguen faltando los mismos de siempre.
          </p>
        </div>
      </section>

      {/* ── NUESTRA HISTORIA ── */}
      <section className="py-16 px-6" style={{ background: '#f9fafb' }}>
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl p-10 md:p-14"
               style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 8px 40px rgba(0,0,0,0.06)' }}>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                   style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
                💡
              </div>
              <h2 className="font-black text-gray-900 text-2xl">El problema</h2>
            </div>

            <p className="text-gray-600 leading-relaxed mb-5 text-base">
              Cualquier coleccionista lo conoce: compras sobres, completas la mitad del álbum
              y de repente tienes <strong className="text-gray-900">tres Messis y ningún portero</strong>.
              El intercambio siempre ha existido, pero dependía de conocer a alguien del cole
              o de grupos de WhatsApp caóticos donde perderse es lo habitual.
            </p>
            <p className="text-gray-600 leading-relaxed text-base">
              MatchCard digitaliza ese intercambio. Registras lo que te sobra, lo que te falta,
              y el sistema te conecta automáticamente con coleccionistas cercanos que tienen
              exactamente lo que necesitas — y necesitan lo que tú tienes.
            </p>
          </div>
        </div>
      </section>

      {/* ── MISIÓN ── */}
      <section className="py-16 px-6" style={{ background: '#fff' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-black text-gray-900 text-3xl mb-3 tracking-tight">Nuestra misión</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Tres valores que guían cada decisión en MatchCard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🌍',
                title: 'Comunidad primero',
                desc: 'Creemos que coleccionar es más divertido juntos. MatchCard es el lugar de encuentro de coleccionistas de toda España y Latinoamérica.',
                color: '#eef2ff',
              },
              {
                icon: '♻️',
                title: 'Intercambio justo',
                desc: 'Sin dinero, sin comisiones, sin intermediarios. Un cromo por otro. La esencia pura del intercambio tal como siempre ha sido.',
                color: '#f0fdf4',
              },
              {
                icon: '🔒',
                title: 'Confianza y seguridad',
                desc: 'Perfiles verificados, valoraciones reales y un sistema de reputación para que cada intercambio sea una experiencia tranquila.',
                color: '#fff7ed',
              },
            ].map(({ icon, title, desc, color }) => (
              <div key={title} className="rounded-2xl p-7 flex flex-col gap-4"
                   style={{ background: color, border: '1px solid rgba(0,0,0,0.05)' }}>
                <span className="text-3xl">{icon}</span>
                <h3 className="font-black text-gray-900 text-lg leading-snug">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EQUIPO ── */}
      <section className="py-16 px-6" style={{ background: '#f9fafb' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-black text-gray-900 text-3xl mb-3 tracking-tight">El equipo</h2>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              Un proyecto creado por un coleccionista, para coleccionistas.
            </p>
          </div>

          <div className="flex justify-center">
            {EQUIPO.map(({ nombre, rol, emoji, desc }) => (
              <div key={nombre} className="rounded-2xl p-7 text-center flex flex-col items-center gap-3 max-w-sm w-full"
                   style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                     style={{ background: 'linear-gradient(135deg, #1e1b4b, #3730a3)' }}>
                  {emoji}
                </div>
                <div>
                  <p className="font-black text-gray-900 text-lg">{nombre}</p>
                  <p className="text-xs font-bold uppercase tracking-widest mt-0.5" style={{ color: '#4338ca' }}>{rol}</p>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-6"
               style={{ background: 'linear-gradient(135deg, #0f0e1a 0%, #1e1b4b 50%, #4338ca 100%)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-black text-white text-3xl mb-4 tracking-tight">
            ¿Te unes a nosotros?
          </h2>
          <p className="text-white/72 text-lg mb-10 leading-relaxed max-w-lg mx-auto">
            Forma parte de la comunidad y empieza a intercambiar cromos hoy mismo.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register"
              className="font-black uppercase tracking-widest px-9 py-4 rounded-xl text-sm text-gray-900 shadow-xl transition-all hover:brightness-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}>
              Crear cuenta gratis
            </Link>
            <Link to="/"
              className="font-bold px-9 py-4 rounded-xl text-sm text-white border border-white/30 hover:bg-white/10 transition-all">
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
