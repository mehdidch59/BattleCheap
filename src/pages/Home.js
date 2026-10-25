import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import TiltCard from '../components/TiltCard';
import FleetArsenal from '../components/FleetArsenal';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { sound } from '../utils/audio';
import { getRankProgress } from '../utils/ranks';
import RankInsignia from '../components/RankInsignia';
import {
  RadarIcon,
  AiChipIcon,
  SatelliteIcon,
  MedalIcon,
  SkullIcon,
  CrosshairIcon,
  SoundWaveIcon,
  ShieldIcon
} from '../components/TacticalIcons';

// Circular SVG Win-Rate Dial Gauge (Inspired by modern SaaS dashboards)
const WinRateDial = ({ rate }) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (rate / 100) * circumference;
  const color = rate >= 50 ? 'var(--nav-teal)' : 'var(--nav-gold)';

  return (
    <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
        {/* Track circle */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="rgba(136, 146, 176, 0.15)"
          strokeWidth="6"
          fill="none"
        />
        {/* Animated value circle */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: `drop-shadow(0 0 6px ${color})`
          }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
        <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color }}>
          {rate}%
        </div>
        <div className="mono" style={{ fontSize: '0.52rem', color: 'var(--nav-slate)', letterSpacing: '0.5px' }}>
          RATIO
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [error, setError] = useState('');
  const [soloDifficulty, setSoloDifficulty] = useState('veteran');
  const [history, setHistory] = useState([]);

  const navigate = useNavigate();
  const { isConnected, emit, on, off, socketError } = useSocket();
  const { currentUser } = useAuth();

  // Load history if user is authenticated
  useEffect(() => {
    const fetchHistory = async () => {
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().history) {
            const sortedHistory = docSnap.data().history.sort((a, b) => new Date(b.date) - new Date(a.date));
            setHistory(sortedHistory);
            const w = sortedHistory.filter(g => g.result === 'WIN').length;
            localStorage.setItem(`bc_wins_${currentUser.uid}`, w.toString());
          }
        } catch (err) {
          console.error('Error fetching history:', err);
        }
      }
    };

    fetchHistory();
  }, [currentUser]);

  // Socket room events
  useEffect(() => {
    const handleRoomCreated = ({ roomId: createdId }) => {
      sound.playSonarPing();
      navigate(`/game/${createdId}`);
    };

    const handleRoomJoined = ({ roomId: joinedId }) => {
      sound.playSonarPing();
      navigate(`/game/${joinedId}`);
    };

    const handleError = (msg) => {
      sound.playBlip(220, 0.15);
      setError(msg);
    };

    const handleRoomFull = () => {
      sound.playBlip(220, 0.15);
      setError('Cette zone d\'opération est complète (2/2 commandants).');
    };

    const handleRoomNotFound = () => {
      sound.playBlip(220, 0.15);
      setError('Secteur introuvable. Veuillez vérifier le code.');
    };

    if (isConnected) {
      on('roomCreated', handleRoomCreated);
      on('roomJoined', handleRoomJoined);
      on('error', handleError);
      on('roomFull', handleRoomFull);
      on('roomNotFound', handleRoomNotFound);
    }

    return () => {
      if (isConnected) {
        off('roomCreated', handleRoomCreated);
        off('roomJoined', handleRoomJoined);
        off('error', handleError);
        off('roomFull', handleRoomFull);
        off('roomNotFound', handleRoomNotFound);
      }
    };
  }, [navigate, isConnected, on, off]);

  // Launch Solo Simulation vs AI
  const handleStartSolo = () => {
    sound.playLaunch();
    const soloId = `solo-${soloDifficulty}-${Math.random().toString(36).substring(2, 6)}`;
    navigate(`/game/${soloId}`);
  };

  // Generate random room code
  const handleGenerateRandomCode = () => {
    sound.playBlip(800, 0.05);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(code);
  };

  // Create Multiplayer Lobby
  const handleCreateRoom = () => {
    setError('');
    sound.playBlip();
    const newRoomId = roomId.trim() || Math.random().toString(36).substring(2, 8).toUpperCase();
    const username = currentUser ? (currentUser.displayName || currentUser.email) : 'Commandant';
    emit('createRoom', { roomId: newRoomId, username });
  };

  // Join Multiplayer Lobby
  const handleJoinRoom = (e) => {
    e.preventDefault();
    setError('');
    sound.playBlip();
    if (!joinRoomId.trim()) {
      setError('Veuillez entrer le code du secteur à rejoindre');
      return;
    }
    const username = currentUser ? (currentUser.displayName || currentUser.email) : 'Commandant';
    emit('joinRoom', { roomId: joinRoomId.trim(), username });
  };

  // Calculate career statistics & military rank progression
  const totalGames = history.length;
  const wins = history.filter(g => g.result === 'WIN').length;
  const losses = totalGames - wins;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  const rankData = getRankProgress(wins);

  return (
    <div>
      <Header />

      <main className="container" style={{ marginTop: '2.5rem', paddingBottom: '4.5rem' }}>
        {/* Kinetic Hero Banner with Shimmer & Telemetry Strip */}
        <section className="home-hero">
          <div className="hero-telemetry-strip mono">
            <span className="telemetry-item">
              <span className="status-indicator online blink-slow" style={{ width: '7px', height: '7px' }} />
              SEC_NET: 04-NORAD
            </span>
            <span className="telemetry-separator">/</span>
            <span className="telemetry-item">RADAR: SYNCHRONISÉ</span>
            <span className="telemetry-separator">/</span>
            <span className="telemetry-item" style={{ color: 'var(--nav-teal)', fontWeight: 'bold' }}>
              DEFCON 1 ACTIF
            </span>
          </div>

          <h1 className="hero-title">
            BATTLECHEAP
          </h1>

          <div className="hero-radar-badge mono">
            <RadarIcon size={16} color="var(--nav-teal)" />
            <span>CENTRE DE COMMANDEMENT NAVAL STRATÉGIQUE</span>
          </div>

          <p className="hero-description mono">
            Plateforme tactique de guerre navale en haute mer. Engagez des cibles ennemies en simulation solo face à l'I.A. ou défiez d'autres commandants en réseau sécurisé.
          </p>
        </section>

        {/* Global Alert Notification */}
        {(error || socketError) && (
          <div className="alert alert-danger" style={{ maxWidth: '1120px', margin: '0 auto 2rem' }}>
            {error || socketError}
          </div>
        )}

        {/* Modern Bento Grid Layout (Inspired by getdesign.md & modulify.ai) */}
        <div className="bento-container">
          {/* Bento Cell 1: Solo Simulation vs AI (Gold Theme) */}
          <TiltCard accent="gold" className="bento-card bento-card-solo">
            <div className="bento-card-inner">
              <div>
                {/* Header */}
                <div className="mode-card-header">
                  <div className="mode-icon-box gold">
                    <AiChipIcon size={26} color="var(--nav-gold)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ color: 'var(--nav-gold)', margin: 0, fontSize: '1.15rem', letterSpacing: '1.5px' }}>
                        SIMULATION TACTIQUE
                      </h3>
                      <span className="mono status-chip gold">
                        HORS-LIGNE
                      </span>
                    </div>
                    <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--nav-slate)', marginTop: '2px' }}>
                      ENTRAÎNEMENT FACE À L'I.A.
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.88rem', color: 'var(--nav-slate)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Affrontez instantanément un algorithme naval tactique doté de prise de décision autonome, sans attente ni dépendance réseau.
                </p>

                {/* Protocol / Difficulty Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <label className="mono" style={{ color: 'var(--nav-text)', fontSize: '0.72rem', letterSpacing: '1px' }}>
                      PROTOCOLE DE COMBAT I.A.
                    </label>
                    <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--nav-gold)' }}>
                      {soloDifficulty === 'recruit' ? 'MENACE 1/3' : soloDifficulty === 'veteran' ? 'MENACE 2/3' : 'MENACE 3/3 (MAX)'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {[
                      { id: 'recruit', label: 'RECRUE', desc: 'Basique' },
                      { id: 'veteran', label: 'VÉTÉRAN', desc: 'Parité & Traque' },
                      { id: 'admiral', label: 'AMIRAL', desc: 'Densité Heatmap' }
                    ].map(tier => {
                      const isSelected = soloDifficulty === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => {
                            sound.playBlip(680, 0.05);
                            setSoloDifficulty(tier.id);
                          }}
                          className={`protocol-btn ${isSelected ? 'selected' : ''}`}
                        >
                          <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{tier.label}</div>
                          <div className="mono" style={{ fontSize: '0.62rem', opacity: 0.85, marginTop: '2px' }}>{tier.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Main Action CTA */}
              <div>
                <button
                  className="btn btn-primary btn-gold-beam"
                  onClick={handleStartSolo}
                  style={{
                    width: '100%',
                    borderColor: 'var(--nav-gold)',
                    color: 'var(--nav-gold)',
                    padding: '0.95rem',
                    fontWeight: 600
                  }}
                >
                  LANCER L'EXERCICE (SOLO)
                </button>
              </div>
            </div>
          </TiltCard>

          {/* Bento Cell 2: Online Multiplayer Operations (Teal Theme) */}
          <TiltCard accent="teal" className="bento-card bento-card-multi">
            <div className="bento-card-inner">
              <div>
                {/* Header */}
                <div className="mode-card-header">
                  <div className="mode-icon-box teal">
                    <SatelliteIcon size={26} color="var(--nav-teal)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ color: 'var(--nav-teal)', margin: 0, fontSize: '1.15rem', letterSpacing: '1.5px' }}>
                        FRONT MULTIJOUEUR
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`status-indicator ${isConnected ? 'online' : 'offline'}`} />
                        <span className="mono" style={{ fontSize: '0.7rem', color: isConnected ? 'var(--nav-teal)' : 'var(--nav-red)' }}>
                          {isConnected ? 'EN LIGNE' : 'CONNEXION'}
                        </span>
                      </div>
                    </div>
                    <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--nav-slate)', marginTop: '2px' }}>
                      LIAISON CHIFFRÉE DIRECTE
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.88rem', color: 'var(--nav-slate)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Ouvrez un secteur de bataille pour affronter un ami en temps réel ou connectez-vous aux coordonnées d'une salle active.
                </p>

                {/* Create Room Action with Generator */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="CODE SECTEUR (EX: SIGMA)"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                        maxLength={8}
                        style={{ marginBottom: 0, fontSize: '0.82rem', paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={handleGenerateRandomCode}
                        className="random-code-btn"
                        title="Générer un code aléatoire"
                        aria-label="Générer un code aléatoire"
                      >
                        🎲
                      </button>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={handleCreateRoom}
                      disabled={!isConnected}
                      style={{ whiteSpace: 'nowrap', padding: '0.8rem 1.25rem' }}
                    >
                      CRÉER
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="tactical-divider mono">
                  OU REJOINDRE UN SECTEUR
                </div>

                {/* Join Room Action */}
                <form onSubmit={handleJoinRoom} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ENTRER LE CODE (EX: A8F3B9)"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                    maxLength={8}
                    style={{ marginBottom: 0, fontSize: '0.82rem' }}
                  />
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    disabled={!isConnected}
                    style={{ whiteSpace: 'nowrap', padding: '0.8rem 1.25rem' }}
                  >
                    REJOINDRE
                  </button>
                </form>
              </div>

              {/* Footer status link */}
              <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--nav-slate)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>CANAL WEBSOCKET v4</span>
                <span style={{ color: isConnected ? 'var(--nav-teal)' : 'var(--nav-red)' }}>
                  {isConnected ? '● CANAL SÉCURISÉ ACTIF' : '○ RECHERCHE SERVEUR...'}
                </span>
              </div>
            </div>
          </TiltCard>

          {/* Bento Cell 3: Interactive Naval Arsenal Showcase (Spans Across) */}
          <div className="bento-card bento-card-arsenal">
            <FleetArsenal />
          </div>

          {/* Bento Cell 4: Commander Career Telemetry & Service Record */}
          <div className="bento-card bento-card-stats">
            {currentUser ? (
              <div className="career-bento-inner">
                <div className="career-bento-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          background: rankData.currentRank.badgeBg,
                          border: `1.5px solid ${rankData.currentRank.badgeBorder}`,
                          borderRadius: '8px',
                          padding: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 0 15px ${rankData.currentRank.badgeBg}`
                        }}
                        title={`${rankData.currentRank.title} (${rankData.currentRank.code})`}
                      >
                        <RankInsignia rankId={rankData.currentRank.id} size={42} />
                      </div>
                      <WinRateDial rate={winRate} />
                    </div>

                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="mono" style={{ color: 'var(--nav-teal)', fontSize: '0.72rem', letterSpacing: '1px' }}>
                          REGISTRE DU COMMANDANT
                        </span>
                        <span
                          className="mono"
                          style={{
                            fontSize: '0.65rem',
                            color: rankData.currentRank.color,
                            border: `1px solid ${rankData.currentRank.badgeBorder}`,
                            background: rankData.currentRank.badgeBg,
                            padding: '1px 6px',
                            borderRadius: '3px',
                            fontWeight: 'bold'
                          }}
                        >
                          {rankData.currentRank.code}
                        </span>
                      </div>
                      <h4 style={{ margin: '3px 0 2px', color: 'var(--nav-text)', fontSize: '1.15rem', letterSpacing: '1px' }}>
                        {currentUser.displayName || currentUser.email}
                      </h4>
                      <div className="mono" style={{ color: rankData.currentRank.color, fontSize: '0.75rem', fontWeight: 600 }}>
                        {rankData.currentRank.title}
                      </div>

                      {/* Rank Promotion Progress Bar */}
                      {rankData.nextRank ? (
                        <div style={{ marginTop: '0.6rem', maxWidth: '300px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '3px' }} className="mono">
                            <span style={{ color: 'var(--nav-slate)' }}>VERS {rankData.nextRank.shortTitle}</span>
                            <span style={{ color: rankData.currentRank.color }}>{rankData.progress}% ({rankData.remaining} vict. requise{rankData.remaining > 1 ? 's' : ''})</span>
                          </div>
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${rankData.progress}%`, height: '100%', background: rankData.currentRank.color, transition: 'width 0.8s ease' }} />
                          </div>
                        </div>
                      ) : (
                        <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--nav-teal)', marginTop: '0.4rem' }}>
                          ★ RANG SUPRÊME ATTEINT (ÉTAT-MAJOR)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Career Metrics Pills */}
                  <div className="career-metrics-row mono">
                    <div className="career-metric-pill">
                      <span className="metric-title">ENGAGEMENTS</span>
                      <span className="metric-num">{totalGames}</span>
                    </div>
                    <div className="career-metric-pill win">
                      <span className="metric-title">VICTOIRES</span>
                      <span className="metric-num">{wins}</span>
                    </div>
                    <div className="career-metric-pill loss">
                      <span className="metric-title">DÉFAITES</span>
                      <span className="metric-num">{losses}</span>
                    </div>
                  </div>
                </div>

                {/* History Mission Log */}
                {history.length === 0 ? (
                  <div className="mono" style={{ textAlign: 'center', color: 'var(--nav-slate)', padding: '2rem 0', fontStyle: 'italic', fontSize: '0.82rem' }}>
                    Aucune mission enregistrée dans le journal de bord. Engagez un combat pour initialiser votre palmarès militaire.
                  </div>
                ) : (
                  <div className="career-history-scroll">
                    {history.slice(0, 10).map((game, index) => {
                      const isWin = game.result === 'WIN';
                      return (
                        <div
                          key={index}
                          className={`history-log-row ${isWin ? 'win' : 'loss'}`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {isWin ? (
                              <MedalIcon size={18} color="var(--nav-teal)" />
                            ) : (
                              <SkullIcon size={18} color="var(--nav-red)" />
                            )}
                            <div>
                              <div className="mono" style={{
                                color: isWin ? 'var(--nav-teal)' : 'var(--nav-red)',
                                fontWeight: 'bold',
                                fontSize: '0.82rem'
                              }}>
                                {isWin ? 'VICTOIRE NAVALE' : 'BÂTIMENTS SUBMERGÉS'}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--nav-slate)', marginTop: '1px' }}>
                                CIBLE : <span style={{ color: 'var(--nav-text)' }}>{game.opponent}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mono" style={{ textAlign: 'right', fontSize: '0.68rem', color: 'var(--nav-slate)' }}>
                            <div>{new Date(game.date).toLocaleDateString()}</div>
                            <div>{new Date(game.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="unauth-bento-prompt">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="mode-icon-box teal">
                    <ShieldIcon size={24} color="var(--nav-teal)" />
                  </div>
                  <div>
                    <div className="mono" style={{ color: 'var(--nav-teal)', fontSize: '0.78rem', letterSpacing: '1px' }}>
                      REGISTRE DU COMMANDANT VERROUILLÉ
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--nav-slate)', marginTop: '2px' }}>
                      Connectez votre matricule pour enregistrer vos états de service, médailles de guerre et télémétrie de victoires.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <Link
                    to="/login"
                    className="btn btn-primary"
                    onClick={() => sound.playBlip()}
                    style={{ padding: '0.65rem 1.4rem', fontSize: '0.8rem' }}
                  >
                    CONNEXION
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-secondary"
                    onClick={() => sound.playBlip()}
                    style={{ padding: '0.65rem 1.4rem', fontSize: '0.8rem' }}
                  >
                    ENRÔLEMENT
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feature Highlights Strip */}
        <section className="features-strip">
          <div className="feature-pill">
            <div className="feature-pill-icon">
              <CrosshairIcon size={22} color="var(--nav-teal)" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--nav-text)', letterSpacing: '1px' }}>
                COMMAND BRIDGE 10x10
              </div>
              <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--nav-slate)', marginTop: '2px' }}>
                Passerelle côte-à-côte avec réticule et télémétrie active
              </div>
            </div>
          </div>

          <div className="feature-pill">
            <div className="feature-pill-icon">
              <ShieldIcon size={22} color="var(--nav-gold)" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--nav-text)', letterSpacing: '1px' }}>
                STRATÉGIE I.A. AVANCÉE
              </div>
              <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--nav-slate)', marginTop: '2px' }}>
                Balayage par damier & carte thermique de probabilités
              </div>
            </div>
          </div>

          <div className="feature-pill">
            <div className="feature-pill-icon">
              <SoundWaveIcon size={22} color="var(--nav-teal)" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--nav-text)', letterSpacing: '1px' }}>
                SYNTHÈSE AUDIO WEB
              </div>
              <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--nav-slate)', marginTop: '2px' }}>
                Pings sonar, salves d'artillerie et explosions temps réel
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
