import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useUserStore } from '../store/userStore';
import { toast } from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useUserStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get('/users/profile')
      .then(({ data }) => setProfile(data.user))
      .catch(() => toast.error('Error cargando perfil'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color:'#eee', textAlign:'center', marginTop:'3rem' }}>Cargando...</p>;
  if (!profile) return null;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>{profile.username}</h1>
      <p style={styles.sub}>{profile.email} · {profile.ciudad}</p>

      <div style={styles.grid}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Repetidos ({profile.inventario.repetidos.length})</h2>
          <ul style={styles.list}>
            {profile.inventario.repetidos.map(c => (
              <li key={c._id} style={styles.item}>
                <strong>#{c.numero}</strong> {c.nombre}
                <span style={styles.tag}>{c.expansion}</span>
              </li>
            ))}
            {profile.inventario.repetidos.length === 0 && <li style={styles.empty}>Sin cromos repetidos</li>}
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Faltas ({profile.inventario.faltas.length})</h2>
          <ul style={styles.list}>
            {profile.inventario.faltas.map(c => (
              <li key={c._id} style={styles.item}>
                <strong>#{c.numero}</strong> {c.nombre}
                <span style={styles.tag}>{c.expansion}</span>
              </li>
            ))}
            {profile.inventario.faltas.length === 0 && <li style={styles.empty}>Sin cromos en lista de faltas</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page:         { maxWidth:'900px', margin:'2rem auto', padding:'0 1rem', color:'#eee' },
  title:        { color:'#e94560', marginBottom:'0.3rem' },
  sub:          { color:'#aaa', marginBottom:'2rem' },
  grid:         { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem' },
  section:      { background:'#16213e', borderRadius:'8px', padding:'1.5rem' },
  sectionTitle: { color:'#e94560', marginTop:0 },
  list:         { listStyle:'none', padding:0, margin:0 },
  item:         { padding:'0.5rem 0', borderBottom:'1px solid #1a1a2e', display:'flex', alignItems:'center', gap:'0.5rem' },
  tag:          { background:'#0f3460', padding:'0.1rem 0.5rem', borderRadius:'12px', fontSize:'0.75rem', marginLeft:'auto' },
  empty:        { color:'#666', fontStyle:'italic' },
};
