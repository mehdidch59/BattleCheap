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
    <header className="navbar" style={{ padding: '1rem', backgroundColor: '#333', color: 'white' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
          BattleCheap
        </Link>
        
        <nav>
          {currentUser ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span>Bonjour, {currentUser.displayName || currentUser.email}</span>
              <button 
                onClick={handleLogout}
                className="btn btn-secondary"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/login" className="btn btn-primary">Connexion</Link>
              <Link to="/register" className="btn btn-secondary">Inscription</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header; 