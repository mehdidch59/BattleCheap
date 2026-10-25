import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import TiltCard from '../components/TiltCard';
import { sound } from '../utils/audio';
import { ShieldIcon } from '../components/TacticalIcons';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      sound.playBlip(220, 0.1);
      return setError('Veuillez remplir tous les champs de connexion.');
    }

    try {
      sound.playSonarPing();
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error('Erreur de connexion:', err);
      sound.playBlip(220, 0.15);
      setError(
        err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
          ? 'Identifiant ou code d\'accès incorrect.'
          : 'Erreur lors de la tentative de connexion.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />

      <main className="container" style={{ marginTop: '3.5rem', display: 'flex', justifyContent: 'center', paddingBottom: '3rem' }}>
        <TiltCard accent="teal" className="bento-card auth-bento-card" style={{ width: '100%', maxWidth: '480px' }}>
          <div style={{ padding: '2.25rem' }}>
            {/* Header Telemetry */}
            <div className="auth-telemetry-strip mono">
              <span className="status-indicator online blink-slow" style={{ width: '6px', height: '6px' }} />
              <span>SEC_AUTH: DEFCON-1 • NORAD CRYPTO-LINK</span>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '50%', background: 'rgba(100, 255, 218, 0.1)', border: '1px solid rgba(100, 255, 218, 0.3)', marginBottom: '0.75rem' }}>
                <ShieldIcon size={28} color="var(--nav-teal)" />
              </div>
              <h2 style={{ color: 'var(--nav-text)', margin: 0, fontSize: '1.6rem', letterSpacing: '2px' }}>
                AUTHENTIFICATION
              </h2>
              <p className="mono" style={{ color: 'var(--nav-slate)', fontSize: '0.78rem', marginTop: '0.4rem' }}>
                Liaison sécurisée de commandement naval
              </p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="mono" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--nav-text)', fontSize: '0.8rem' }}>
                  IDENTIFIANT MILITAIRE (EMAIL)
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
                    CODE DE SÉCURITÉ
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
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.25rem', padding: '0.95rem', fontWeight: 600 }}
                disabled={loading}
              >
                {loading ? 'AUTHENTIFICATION EN COURS...' : 'ÉTABLIR LA LIAISON TACTIQUE'}
              </button>
            </form>

            <div className="text-center mt-3" style={{ borderTop: '1px solid var(--nav-lighter)', paddingTop: '1.25rem', marginTop: '1.75rem' }}>
              <span style={{ color: 'var(--nav-slate)', fontSize: '0.82rem' }}>Pas encore de matricule ? </span>
              <Link
                to="/register"
                onClick={() => sound.playBlip()}
                style={{ color: 'var(--nav-teal)', textDecoration: 'none', fontWeight: 'bold' }}
              >
                ENRÔLEMENT OFFICIEL
              </Link>
            </div>
          </div>
        </TiltCard>
      </main>
    </div>
  );
};

export default Login;
