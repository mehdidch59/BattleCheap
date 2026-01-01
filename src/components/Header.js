import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <header className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" className="logo">
          <span>BATTLE</span>CHEAP
        </Link>

        <nav>
          {currentUser ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', marginRight: '1rem' }}>
                <div style={{ color: 'var(--nav-slate)' }}>OPERATOR_ID</div>
                <div className="mono" style={{ color: 'var(--nav-teal)' }}>{currentUser.displayName || currentUser.email || 'UNIDENTIFIED'}</div>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', textDecoration: 'none' }}>LOGIN</Link>
              <Link to="/register" className="btn btn-secondary" style={{ padding: '0.5rem 1.5rem', textDecoration: 'none' }}>REGISTER</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;