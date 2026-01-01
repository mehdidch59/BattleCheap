import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return setError('Veuillez remplir tous les champs');
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(
        error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password'
          ? 'Email ou mot de passe incorrect'
          : 'Erreur lors de la connexion'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />

      <main className="container" style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center' }}>
        <div className="tactical-panel" style={{ width: '100%', maxWidth: '450px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--nav-teal)', margin: 0 }}>ACCESS CONTROL</h2>
            <div className="mono" style={{ color: 'var(--nav-slate)', fontSize: '0.8rem' }}>SECURE LOGIN REQUIRED</div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="mono" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--nav-text)' }}>EMAIL CREDENTIALS</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="ENTER EMAIL"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="mono" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--nav-text)' }}>SECURITY CODE</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="ENTER PASSWORD"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? 'AUTHENTICATING...' : 'ESTABLISH LINK'}
            </button>
          </form>

          <div className="text-center mt-3" style={{ borderTop: '1px solid var(--nav-lighter)', paddingTop: '1rem', marginTop: '2rem' }}>
            <span style={{ color: 'var(--nav-slate)', fontSize: '0.9rem' }}>NO CREDENTIALS? </span>
            <Link to="/register" style={{ color: 'var(--nav-teal)', textDecoration: 'none', fontWeight: 'bold' }}>INITIATE REGISTRATION</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;