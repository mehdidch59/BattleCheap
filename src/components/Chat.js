import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const { socket, on, off, emit } = useSocket();
    const { currentUser } = useAuth();
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    const currentUsername = currentUser ? (currentUser.displayName || currentUser.email) : 'Unknown';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleReceiveMessage = (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
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
            emit('sendMessage', { message: newMessage });
            setNewMessage('');
        }
    };

    return (
        <div className="tactical-panel" style={{
            marginTop: '2rem',
            height: '300px',
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
            border: '1px solid var(--nav-lighter)'
        }}>
            <div style={{
                borderBottom: '1px solid var(--nav-teal)',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--nav-teal)' }}>SECURE COMMS</h4>
                <div className="status-indicator online" style={{ width: '8px', height: '8px' }}></div>
            </div>

            <div className="chat-messages" ref={chatContainerRef} style={{
                flex: 1,
                overflowY: 'auto',
                marginBottom: '1rem',
                paddingRight: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                {messages.length === 0 ? (
                    <div className="mono" style={{ color: 'var(--nav-slate)', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', marginTop: '1rem' }}>
                        CHANNEL OPEN. NO TRAFFIC.
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.sender === currentUsername;
                        return (
                            <div key={index} style={{
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                                backgroundColor: isMe ? 'rgba(100, 255, 218, 0.1)' : 'rgba(136, 146, 176, 0.1)',
                                border: isMe ? '1px solid rgba(100, 255, 218, 0.3)' : '1px solid rgba(136, 146, 176, 0.3)',
                                padding: '0.5rem',
                                borderRadius: '4px',
                                borderTopRightRadius: isMe ? '0' : '4px',
                                borderTopLeftRadius: isMe ? '4px' : '0'
                            }}>
                                <div style={{
                                    fontSize: '0.7rem',
                                    color: isMe ? 'var(--nav-teal)' : 'var(--nav-gold)',
                                    fontWeight: 'bold',
                                    marginBottom: '0.2rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: '1rem'
                                }}>
                                    <span>{isMe ? 'YOU' : msg.sender}</span>
                                    <span style={{ opacity: 0.7 }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="mono" style={{ fontSize: '0.9rem', color: 'var(--nav-text)', wordBreak: 'break-word' }}>
                                    {msg.text}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    className="form-control mono"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="ENTER MESSAGE..."
                    style={{
                        flex: 1,
                        fontSize: '0.9rem',
                        backgroundColor: 'rgba(2, 12, 27, 0.7)',
                        color: 'var(--nav-text)',
                        border: '1px solid var(--nav-slate)'
                    }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                    SEND
                </button>
            </form>
        </div>
    );
};

export default Chat;
