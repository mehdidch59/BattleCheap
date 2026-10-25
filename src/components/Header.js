import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';
import { SoundOnIcon, SoundMuteIcon } from './TacticalIcons';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [showSettings, setShowSettings] = useState(false);
  const [masterVol, setMasterVol] = useState(sound.masterVolume);
  const [shakeDisabled, setShakeDisabled] = useState(localStorage.getItem('bc_disable_shake') === 'true');

  const handleLogout = async () => {
    sound.playBlip();
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sound.playSonarPing();
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setMasterVol(val);
    sound.setMasterVolume(val);
    if (isMuted) {
      setIsMuted(false);
      sound.toggleMute();
    }
  };

  const handleToggleShake = () => {
    const newVal = !shakeDisabled;
    setShakeDisabled(newVal);
    localStorage.setItem('bc_disable_shake', newVal.toString());
  };

  return (
    <header className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        {/* Brand Logo with Radar Ping */}
        <Link
          to="/"
          className="logo"
          onClick={() => { sound.playSonarPing(); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span className="logo-radar-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--nav-teal)" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" strokeDasharray="3 3" />
              <circle cx="12" cy="12" r="2" fill="var(--nav-teal)" />
              <line x1="12" y1="12" x2="20" y2="4" stroke="var(--nav-teal)" strokeWidth="1.5" />
            </svg>
          </span>
          <span className="logo-brand-text">BATTLECHEAP</span>
        </Link>

        {/* Tactical Controls & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Audio & Settings Popover Toggle */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                sound.playBlip();
                setShowSettings(prev => !prev);
              }}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Paramètres audio et tactiques"
              aria-label="Paramètres sonores"
            >
              {isMuted ? <SoundMuteIcon size={16} color="var(--nav-red)" /> : <SoundOnIcon size={16} color="var(--nav-teal)" />}
              <span className="mono" style={{ fontSize: '0.75rem' }}>{Math.round(masterVol * 100)}%</span>
            </button>

            {/* Quick Settings Dropdown */}
            {showSettings && (
              <div
                className="tactical-panel settings-dropdown"
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '240px',
                  zIndex: 200,
                  padding: '1rem',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
                }}
              >
                <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--nav-teal)', marginBottom: '0.75rem', borderBottom: '1px solid var(--nav-lighter)', paddingBottom: '0.4rem' }}>
                  CONTRÔLES AUDIO & CONFORT
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--nav-slate)' }}>VOLUME GÉNÉRAL</span>
                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--nav-text)' }}>{Math.round(masterVol * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={masterVol}
                    onChange={handleVolumeChange}
                    style={{ width: '100%', accentColor: 'var(--nav-teal)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button
                    onClick={handleToggleMute}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}
                  >
                    {isMuted ? 'RÉACTIVER' : 'COUPER'}
                  </button>
                  <button
                    onClick={() => sound.playSonarPing()}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}
                  >
                    TEST SONAR
                  </button>
                </div>

                <div style={{ borderTop: '1px solid var(--nav-lighter)', paddingTop: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--nav-text)' }}>
                    <input
                      type="checkbox"
                      checked={shakeDisabled}
                      onChange={handleToggleShake}
                      style={{ accentColor: 'var(--nav-teal)' }}
                    />
                    <span>Désactiver secousses d'écran (anti-cinétose)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* User Auth Info */}
          {currentUser ? (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                <div style={{ color: 'var(--nav-slate)', fontSize: '0.65rem' }}>COMMANDANT</div>
                <div className="mono" style={{ color: 'var(--nav-teal)', fontWeight: 'bold' }}>
                  {currentUser.displayName || currentUser.email}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.75rem' }}
              >
                DÉCONNEXION
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link
                to="/login"
                className="btn btn-primary"
                onClick={() => sound.playBlip()}
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', textDecoration: 'none' }}
              >
                CONNEXION
              </Link>
              <Link
                to="/register"
                className="btn btn-secondary"
                onClick={() => sound.playBlip()}
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', textDecoration: 'none' }}
              >
                REGISTRE
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
