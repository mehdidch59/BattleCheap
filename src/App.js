import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import TacticalBackdrop from './components/TacticalBackdrop';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Game from './pages/Game';
import NotFound from './pages/NotFound';

// Styles
import './App.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="App">
          {/* Interactive Tactical Canvas Backdrop (Canvas Sonar & Node Constellation) */}
          <TacticalBackdrop />

          {/* Application Routes */}
          <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/game/:roomId" element={
                <PrivateRoute>
                  <Game />
                </PrivateRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
