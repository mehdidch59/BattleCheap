import React, { useEffect, useRef } from 'react';

const CombatLog = ({ logs = [] }) => {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="combat-log tactical-panel" style={{
      padding: '0.8rem',
      height: '180px',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(2, 12, 27, 0.85)',
      border: '1px solid var(--nav-lighter)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(100, 255, 218, 0.2)',
        paddingBottom: '0.4rem',
        marginBottom: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="status-indicator online" style={{ width: '6px', height: '6px' }}></span>
          <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--nav-teal)', fontWeight: 'bold' }}>
            JOURNAL TÉLÉMÉTRIQUE DE COMBAT
          </span>
        </div>
        <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--nav-slate)' }}>
          CANAL SÉCURISÉ 408
        </span>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        paddingRight: '4px'
      }}>
        {logs.length === 0 ? (
          <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--nav-slate)', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>
            EN ATTENTE DE L'ENGAGEMENT...
          </div>
        ) : (
          logs.map((item, idx) => {
            let color = 'var(--nav-slate)';
            if (item.type === 'hit') color = 'var(--nav-gold)';
            if (item.type === 'sink') color = 'var(--nav-red)';
            if (item.type === 'win') color = 'var(--nav-teal)';
            if (item.type === 'loss') color = 'var(--nav-red)';

            return (
              <div key={idx} className="mono" style={{
                fontSize: '0.75rem',
                color,
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'baseline',
                borderLeft: `2px solid ${color}`,
                paddingLeft: '0.4rem',
                background: item.type === 'sink' ? 'rgba(255, 71, 87, 0.1)' : 'transparent'
              }}>
                <span style={{ color: 'var(--nav-slate)', fontSize: '0.65rem', minWidth: '55px' }}>
                  [{item.time}]
                </span>
                <span style={{ flex: 1, wordBreak: 'break-word' }}>
                  {item.text}
                </span>
              </div>
            );
          })
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default CombatLog;
