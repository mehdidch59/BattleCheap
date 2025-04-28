import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const NotFound = () => {
  return (
    <div>
      <Header />
      
      <main className="container" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <h1>404</h1>
        <h2>Page non trouvée</h2>
        <p>Désolé, la page que vous recherchez n'existe pas.</p>
        <Link to="/" className="btn btn-primary">
          Retour à l'accueil
        </Link>
      </main>
    </div>
  );
};

export default NotFound; 