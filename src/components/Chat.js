import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';

const QUICK_RADIO_COMMS = [
  { id: 'acquired', icon: '🎯', label: 'CIBLE ACQUISE' },
  { id: 'impact', icon: '💥', label: 'DIRECT DANS LE MILLE !' },
  { id: 'defensive', icon: '🛡️', label: 'FORMATION DÉFENSIVE' },
  { id: 'salute', icon: '⚓', label: 'SALUT MILITAIRE' },
  { id: 'alert', icon: '⚠️', label: 'SECTEUR CRITIQUE !' },
];

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { socket, on, off, emit } = useSocket();
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const currentUsername = currentUser ? (currentUser.displayName || currentUser.email) : 'Commandant';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
      sound.playRadioTransmission();
    };

    if (socket) {
      on('receiveMessage', handleReceiveMessage);
    }

    return () => {
      if (socket) {
        off('receiveMessage', handleReceiveMessage);
      }
    };
  }, [socket, on, off]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sound.playRadioTransmission();
      emit('sendMessage', { message: newMessage.trim() });
      setNewMessage('');
    }
  };

  const handleSendQuickRadio = (radioText) => {
    sound.playRadioTransmission();
    emit('sendMessage', { message: radioText });
  };

  return (
    <div className="tactical-panel chat-module" style={{
      height: '220px',
      display: 'flex',
      flexDirection: 'column',
      padding: '0.8rem',
      border: '1px solid var(--nav-lighter)',
      background: 'rgba(2, 12, 27, 0.85)'
    }}>
      <div style={{
        borderBottom: '1px solid var(--nav-teal)',
        marginBottom: '0.5rem',
        paddingBottom: '0.4rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="status-indicator online" style={{ width: '6px', height: '6px' }} />
          <h4 style={{ margin: 0, fontSize: '0.75rem', color: 'var(--nav-teal)', letterSpacing: '1px' }}>
            COMMUNICATIONS TACTIQUES SÉCURISÉES
          </h4>
        </div>
        <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--nav-slate)' }}>CANAL OUVERT</span>
      </div>

      <div className="chat-messages" ref={chatContainerRef} style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '0.4rem',
        paddingRight: '4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem'
      }}>
        {messages.length === 0 ? (
          <div className="mono" style={{ color: 'var(--nav-slate)', fontSize: '0.75rem', fontStyle: 'italic', textAlign: 'center', marginTop: '1.5rem' }}>
            Fréquence silencieuse. Prêt pour transmission.
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender === currentUsername;
            return (
              <div key={index} style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                backgroundColor: isMe ? 'rgba(100, 255, 218, 0.12)' : 'rgba(136, 146, 176, 0.12)',
                border: isMe ? '1px solid rgba(100, 255, 218, 0.3)' : '1px solid rgba(136, 146, 176, 0.3)',
                padding: '0.35rem 0.6rem',
                borderRadius: '4px',
                borderTopRightRadius: isMe ? '0' : '4px',
                borderTopLeftRadius: isMe ? '4px' : '0'
              }}>
                <div style={{
                  fontSize: '0.65rem',
                  color: isMe ? 'var(--nav-teal)' : 'var(--nav-gold)',
                  fontWeight: 'bold',
                  marginBottom: '0.1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}>
                  <span>{isMe ? 'VOUS' : msg.sender}</span>
                  <span style={{ opacity: 0.7 }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--nav-text)', wordBreak: 'break-word' }}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Tactical Quick Radio Chips Strip */}
      <div style={{
        display: 'flex',
        gap: '0.35rem',
        overflowX: 'auto',
        paddingBottom: '0.35rem',
        marginBottom: '0.35rem',
        scrollbarWidth: 'none'
      }}>
        {QUICK_RADIO_COMMS.map((radio) => (
          <button
            key={radio.id}
            type="button"
            className="mono"
            onClick={() => handleSendQuickRadio(`${radio.icon} ${radio.label}`)}
            style={{
              whiteSpace: 'nowrap',
              background: 'rgba(100, 255, 218, 0.08)',
              border: '1px solid rgba(100, 255, 218, 0.25)',
              color: 'var(--nav-teal)',
              padding: '2px 7px',
              borderRadius: '3px',
              fontSize: '0.65rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(100, 255, 218, 0.2)';
              e.currentTarget.style.borderColor = 'var(--nav-teal)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(100, 255, 218, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(100, 255, 218, 0.25)';
            }}
            title={`Émettre: "${radio.label}"`}
          >
            <span>{radio.icon}</span>
            <span>{radio.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          className="form-control mono"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="TRANSMETTRE ORDRE OU MESSAGE..."
          style={{
            flex: 1,
            fontSize: '0.8rem',
            padding: '0.4rem 0.75rem',
            marginBottom: 0,
            backgroundColor: 'rgba(2, 12, 27, 0.8)',
            border: '1px solid var(--nav-lighter)'
          }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!newMessage.trim()}
          style={{ padding: '0.4rem 0.9rem', fontSize: '0.75rem' }}
        >
          ENVOYER
        </button>
      </form>
    </div>
  );
};

export default Chat;
