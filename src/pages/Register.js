import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import TiltCard from '../components/TiltCard';
import { sound } from '../utils/audio';
import { MedalIcon } from '../components/TacticalIcons';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword || !username) {
      sound.playBlip(220, 0.1);
      return setError('Veuillez remplir l\'ensemble des champs d\'enrôlement.');
    }

    if (password !== confirmPassword) {
      sound.playBlip(220, 0.1);
      return setError('Les codes de sécurité ne correspondent pas.');
    }

    if (password.length < 6) {
      sound.playBlip(220, 0.1);
      return setError('Le code de sécurité doit comporter au moins 6 caractères.');
    }

    try {
      sound.playSonarPing();
      setError('');
      setLoading(true);
      await signup(email, password, username);
      navigate('/');
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
      sound.playBlip(220, 0.15);
      if (err.code === 'auth/email-already-in-use') {
        setError('Cet identifiant email est déjà affecté à un autre commandant.');
      } else {
        setError('Échec de la création du profil opérateur.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />

      <main className="container" style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', paddingBottom: '3.5rem' }}>
        <TiltCard accent="teal" className="bento-card auth-bento-card" style={{ width: '100%', maxWidth: '500px' }}>
          <div style={{ padding: '2.25rem' }}>
            {/* Header Telemetry */}
            <div className="auth-telemetry-strip mono">
              <span className="status-indicator online blink-slow" style={{ width: '6px', height: '6px' }} />
              <span>REG_CADRE: INITIALISATION MATRICULE NAVAL</span>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '50%', background: 'rgba(100, 255, 218, 0.1)', border: '1px solid rgba(100, 255, 218, 0.3)', marginBottom: '0.75rem' }}>
                <MedalIcon size={28} color="var(--nav-teal)" />
              </div>
              <h2 style={{ color: 'var(--nav-text)', margin: 0, fontSize: '1.6rem', letterSpacing: '2px' }}>
                NOUVEL OPÉRATEUR
              </h2>
              <p className="mono" style={{ color: 'var(--nav-slate)', fontSize: '0.78rem', marginTop: '0.4rem' }}>
                Ouverture d'un dossier officiel de commandement
              </p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="mono" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--nav-text)', fontSize: '0.8rem' }}>
                  ALIAS DU COMMANDANT (INDICATIF RADIO)
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="Ex: GhostRider"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="mono" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--nav-text)', fontSize: '0.8rem' }}>
                  ADRESSE DE CONTACT OFFICIELLE (EMAIL)
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="capitaine@flotte.mil"
                />
              </div>

              <div className="mb-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label htmlFor="password" className="mono" style={{ color: 'var(--nav-text)', fontSize: '0.8rem' }}>
                    CODE DE SÉCURITÉ (MIN. 6 CARACTÈRES)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="mono"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--nav-teal)',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {showPassword ? 'MASQUER' : 'AFFICHER'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="mono" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--nav-text)', fontSize: '0.8rem' }}>
                  CONFIRMATION DU CODE
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.25rem', padding: '0.95rem', fontWeight: 600 }}
                disabled={loading}
              >
                {loading ? 'ENRÔLEMENT EN COURS...' : 'VALIDER LE DOSSIER MILITAIRE'}
              </button>
            </form>

            <div className="text-center mt-3" style={{ borderTop: '1px solid var(--nav-lighter)', paddingTop: '1.25rem', marginTop: '1.75rem' }}>
              <span style={{ color: 'var(--nav-slate)', fontSize: '0.82rem' }}>Déjà enregistré aux registres ? </span>
              <Link
                to="/login"
                onClick={() => sound.playBlip()}
                style={{ color: 'var(--nav-teal)', textDecoration: 'none', fontWeight: 'bold' }}
              >
                CONNEXION DIRECTE
              </Link>
            </div>
          </div>
        </TiltCard>
      </main>
    </div>
  );
};

export default Register;
