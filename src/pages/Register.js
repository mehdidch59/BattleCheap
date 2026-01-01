import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword || !username) {
      return setError('Veuillez remplir tous les champs');
    }

    if (password !== confirmPassword) {
      return setError('Les mots de passe ne correspondent pas');
    }

    if (password.length < 6) {
      return setError('Le mot de passe doit contenir au moins 6 caractères');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password, username);
      navigate('/');
    } catch (error) {
      console.error('Erreur d\'inscription:', error);

      if (error.code === 'auth/email-already-in-use') {
        setError('Cet email est déjà utilisé');
      } else {
        setError('Erreur lors de l\'inscription');
      }
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
            <h2 style={{ color: 'var(--nav-teal)', margin: 0 }}>NEW OPERATOR</h2>
            <div className="mono" style={{ color: 'var(--nav-slate)', fontSize: '0.8rem' }}>CREATE SECURE PROFILE</div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="mono" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--nav-text)' }}>OPERATOR ALIAS</label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="ENTER USERNAME"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="mono" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--nav-text)' }}>EMAIL ADDRESS</label>
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
              <label htmlFor="password" className="mono" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--nav-text)' }}>PASSWORD</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="CREATE PASSWORD"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="mono" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--nav-text)' }}>CONFIRM PASSWORD</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="REPEAT PASSWORD"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? 'REGISTERING...' : 'CONFIRM CREDENTIALS'}
            </button>
          </form>

          <div className="text-center mt-3" style={{ borderTop: '1px solid var(--nav-lighter)', paddingTop: '1rem', marginTop: '2rem' }}>
            <span style={{ color: 'var(--nav-slate)', fontSize: '0.9rem' }}>ALREADY REGISTERED? </span>
            <Link to="/login" style={{ color: 'var(--nav-teal)', textDecoration: 'none', fontWeight: 'bold' }}>ACCESS LOGIN</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;