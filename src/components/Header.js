import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { sound } from '../utils/audio';
import { getRank } from '../utils/ranks';
import { CAMOUFLAGES, getActiveCamouflage, setActiveCamouflage } from '../utils/camouflages';
import RankInsignia from './RankInsignia';
import TacticalManualModal from './TacticalManualModal';
import LiquidLogo from './LiquidLogo';
import { SoundOnIcon, SoundMuteIcon } from './TacticalIcons';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [showSettings, setShowSettings] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [masterVol, setMasterVol] = useState(sound.masterVolume);
  const [shakeDisabled, setShakeDisabled] = useState(localStorage.getItem('bc_disable_shake') === 'true');
  const [crtEnabled, setCrtEnabled] = useState(localStorage.getItem('bc_crt_mode') === 'true');
  const [ambiencePlaying, setAmbiencePlaying] = useState(sound.ambiencePlaying);
  const [currentCamo, setCurrentCamo] = useState(getActiveCamouflage());

  const [guestCallsign, setGuestCallsign] = useState(() => {
    return localStorage.getItem('bc_guest_callsign') || 'Commandant Invité';
  });

  const [userWins, setUserWins] = useState(() => {
    if (currentUser?.uid) {
      return parseInt(localStorage.getItem(`bc_wins_${currentUser.uid}`) || '0', 10);
    }
    return 0;
  });

  useEffect(() => {
    if (!currentUser) return;
    const fetchWins = async () => {
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().history) {
          const w = docSnap.data().history.filter(g => g.result === 'WIN').length;
          setUserWins(w);
          localStorage.setItem(`bc_wins_${currentUser.uid}`, w.toString());
        }
      } catch (e) {
        // Non-blocking fetch
      }
    };
    fetchWins();
  }, [currentUser]);

  const currentRank = getRank(userWins);

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

  useEffect(() => {
    if (crtEnabled) {
      document.body.classList.add('crt-mode');
    } else {
      document.body.classList.remove('crt-mode');
    }
  }, [crtEnabled]);

  const handleToggleCrt = () => {
    sound.playBlip(750, 0.04);
    const nextVal = !crtEnabled;
    setCrtEnabled(nextVal);
    localStorage.setItem('bc_crt_mode', nextVal.toString());
  };

  return (
    <header className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        {/* Brand Logo with Liquid Refractive Radar (paper-design/liquid-logo) */}
        <Link
          to="/"
          className="logo"
          onClick={() => { sound.playSonarPing(); }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <LiquidLogo size={28} />
          <span className="logo-brand-text">BATTLECHEAP</span>
        </Link>

        {/* Tactical Controls & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Tactical Manual Field Guide Button */}
          <button
            onClick={() => {
              sound.playBlip();
              setShowManual(true);
            }}
            className="btn btn-secondary mono"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            title="Consulter le manuel de commandement et règles d'engagement"
          >
            <span>📜</span>
            <span>MANUEL</span>
          </button>

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
              <div className={`audio-equalizer ${isMuted ? 'muted' : 'active'}`} aria-hidden="true">
                <span className="eq-bar" />
                <span className="eq-bar" />
                <span className="eq-bar" />
              </div>
            </button>

            {/* Quick Settings Dropdown */}
            {showSettings && (
              <div
                className="tactical-panel settings-dropdown"
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '260px',
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

                {/* Submarine Ambience */}
                <div style={{ borderTop: '1px solid var(--nav-lighter)', paddingTop: '0.75rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--nav-text)' }}>AMBIANCE 55Hz</div>
                    <div className="mono" style={{ fontSize: '0.62rem', color: 'var(--nav-slate)' }}>Drone sub-bass & battement 3Hz</div>
                  </div>
                  <button
                    onClick={() => {
                      const active = sound.toggleAmbience();
                      setAmbiencePlaying(active);
                    }}
                    className={`btn ${ambiencePlaying ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem' }}
                  >
                    {ambiencePlaying ? 'ACTIF' : 'INACTIF'}
                  </button>
                </div>

                {/* Fleet Camouflage Selector */}
                <div style={{ borderTop: '1px solid var(--nav-lighter)', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--nav-text)', marginBottom: '0.4rem' }}>
                    LIVRÉE DE FLOTTE (CAMOUFLAGE)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.35rem' }}>
                    {CAMOUFLAGES.map(c => {
                      const isSel = currentCamo.id === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            sound.playBlip(750, 0.04);
                            const updated = setActiveCamouflage(c.id);
                            setCurrentCamo(updated);
                          }}
                          className="mono"
                          style={{
                            padding: '0.3rem 0.4rem',
                            fontSize: '0.66rem',
                            background: isSel ? `${c.color}22` : 'rgba(2, 12, 27, 0.6)',
                            border: `1px solid ${isSel ? c.color : 'rgba(136, 146, 176, 0.2)'}`,
                            color: isSel ? c.color : 'var(--nav-slate)',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            textAlign: 'left'
                          }}
                        >
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name.split(' ')[1] || c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--nav-lighter)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--nav-text)' }}>
                    <input
                      type="checkbox"
                      checked={crtEnabled}
                      onChange={handleToggleCrt}
                      style={{ accentColor: 'var(--nav-teal)' }}
                    />
                    <span>Filtre CRT / Scanlines phosphoriques</span>
                  </label>

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: currentRank.badgeBg,
                    border: `1px solid ${currentRank.badgeBorder}`,
                    borderRadius: '4px',
                    padding: '3px'
                  }}
                  title={`${currentRank.title} (${currentRank.code}) - ${userWins} victoires`}
                >
                  <RankInsignia rankId={currentRank.id} size={28} />
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                  <div className="mono" style={{ color: currentRank.color, fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                    {currentRank.shortTitle} • {currentRank.code}
                  </div>
                  <div className="mono" style={{ color: 'var(--nav-text)', fontWeight: 'bold' }}>
                    {currentUser.displayName || currentUser.email}
                  </div>
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
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {/* Guest Callsign Selector */}
              <button
                type="button"
                onClick={() => {
                  const newName = window.prompt('ENTREZ VOTRE INDICATIF DE GUERRE (MAX 16 CARACTÈRES) :', guestCallsign);
                  if (newName && newName.trim()) {
                    const cleaned = newName.trim().slice(0, 16);
                    setGuestCallsign(cleaned);
                    localStorage.setItem('bc_guest_callsign', cleaned);
                    sound.playSonarPing();
                  }
                }}
                className="mono"
                style={{
                  background: 'rgba(255, 204, 0, 0.08)',
                  border: '1px solid rgba(255, 204, 0, 0.35)',
                  color: 'var(--nav-gold)',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '3px',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Cliquer pour modifier votre indicatif d'officier"
              >
                <span>🪪</span>
                <span>{guestCallsign}</span>
                <span style={{ opacity: 0.6, fontSize: '0.65rem' }}>✎</span>
              </button>
              <Link
                to="/login"
                className="btn btn-primary"
                onClick={() => sound.playBlip()}
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', textDecoration: 'none' }}
              >
                CONNEXION
              </Link>
              <Link
                to="/register"
                className="btn btn-secondary"
                onClick={() => sound.playBlip()}
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', textDecoration: 'none' }}
              >
                REGISTRE
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tactical Manual Modal */}
      {showManual && (
        <TacticalManualModal onClose={() => setShowManual(false)} />
      )}
    </header>
  );
};

export default Header;
