import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { sound } from '../utils/audio';
import { RadarIcon } from '../components/TacticalIcons';

const NotFound = () => {
  return (
    <div>
      <Header />

      <main className="container" style={{ marginTop: '4rem', textAlign: 'center', paddingBottom: '4rem' }}>
        <div className="tactical-panel" style={{ maxWidth: '550px', margin: '0 auto', padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255, 71, 87, 0.12)',
              border: '2px solid var(--nav-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(255, 71, 87, 0.25)'
            }}>
              <RadarIcon size={36} color="var(--nav-red)" />
            </div>
          </div>
          <h1 style={{ color: 'var(--nav-red)', fontSize: '3.5rem', margin: 0 }}>404</h1>
          <h2 style={{ color: 'var(--nav-text)', letterSpacing: '3px', marginTop: '0.5rem' }}>
            SECTEUR MARITIME INCONNU
          </h2>
          <p className="mono" style={{ color: 'var(--nav-slate)', margin: '1rem 0 2rem' }}>
            Les coordonnées spécifiées n'ont retourné aucun écho radar dans notre système de cartographie navale.
          </p>
          <Link
            to="/"
            className="btn btn-primary"
            onClick={() => sound.playSonarPing()}
            style={{ padding: '0.85rem 2rem' }}
          >
            RETOURNER AU QUARTIER GÉNÉRAL
          </Link>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
