import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef('');
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);

    // Memoized handlers
    const handleErrors = useCallback((e) => {
        console.error('Socket error:', e);
        toast.error('Socket connection failed, try again later.');
        reactNavigator('/');
    }, [reactNavigator]);

    const handleCodeChange = useCallback((code) => {
        codeRef.current = code;
    }, []);

    // Stable socket reference
    const stableSocketRef = useMemo(() => ({
        current: socketRef.current
    }), [socketRef.current]);

    // Socket initialization and event handling
    useEffect(() => {
        const initializeSocket = async () => {
            try {
                socketRef.current = await initSocket();
                const socket = socketRef.current;

                socket.on('connect_error', handleErrors);
                socket.on('connect_failed', handleErrors);

                socket.emit(ACTIONS.JOIN, {
                    roomId,
                    username: location.state?.username,
                });

                const onJoined = ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                    }
                    setClients(clients);
                    socket.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                };

                const onDisconnected = ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients(prev => prev.filter(client => client.socketId !== socketId));
                };

                socket.on(ACTIONS.JOINED, onJoined);
                socket.on(ACTIONS.DISCONNECTED, onDisconnected);

                return () => {
                    socket.off('connect_error', handleErrors);
                    socket.off('connect_failed', handleErrors);
                    socket.off(ACTIONS.JOINED, onJoined);
                    socket.off(ACTIONS.DISCONNECTED, onDisconnected);
                    socket.disconnect();
                };
            } catch (err) {
                handleErrors(err);
            }
        };

        initializeSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [roomId, location.state?.username, handleErrors]);

    const copyRoomId = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID copied to clipboard');
        } catch (err) {
            toast.error('Failed to copy Room ID');
            console.error(err);
        }
    }, [roomId]);

    const leaveRoom = useCallback(() => {
        reactNavigator('/');
    }, [reactNavigator]);

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className="mainWrap">
            <div className="aside" style={{
                background: '#1C1E32',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                borderRadius: '0 8px 8px 0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                color: 'white'
            }}>
                <div className="asideInner">
                    <div className="logo" style={{ textAlign: 'center' }}>
                        <img
                            className="logoImage"
                            src="/Logo2.png"
                            alt="logo"
                            style={{
                                width: '100%',
                                height: '100%',
                                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
                            }}
                        />
                    </div>

                    <div className="sessionInfo" style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '10px',
                        marginBottom: '20px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}>
                            <h3 style={{
                                margin: '0',
                                fontSize: '30px',
                                fontWeight: '600'
                            }}>Room ID</h3>
                            <button
                                onClick={copyRoomId}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#4dabf7',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <span style={{ marginRight: '5px' }}>Copy</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M8 4V16C8 16.5304 8.21071 17.0391 8.58579 17.4142C8.96086 17.7893 9.46957 18 10 18H18C18.5304 18 19.0391 17.7893 19.4142 17.4142C19.7893 17.0391 20 16.5304 20 16V7.242C20 6.97556 19.9467 6.71181 19.8433 6.46624C19.7399 6.22068 19.5885 6.00035 19.398 5.82L16.958 3.58C16.5844 3.22724 16.0826 3.0298 15.56 3.03H10C9.46957 3.03 8.96086 3.24071 8.58579 3.61579C8.21071 3.99086 8 4.49957 8 5.03V5" stroke="#4dabf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M16 18V20C16 20.5304 15.7893 21.0391 15.4142 21.4142C15.0391 21.7893 14.5304 22 14 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V9C4 8.46957 4.21071 7.96086 4.58579 7.58579C4.96086 7.21071 5.46957 7 6 7H8" stroke="#4dabf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                        <div style={{
                            background: 'rgba(0, 0, 0, 0.2)',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontFamily: 'monospace',
                            wordBreak: 'break-all',
                            cursor: 'pointer'
                        }} onClick={copyRoomId}>
                            {roomId}
                        </div>
                    </div>

                    <h3 style={{
                        margin: '0 0 12px 0',
                        fontSize: '18px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#4dabf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 8V16" stroke="#4dabf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 12H16" stroke="#4dabf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Collaborators ({clients.length})
                    </h3>

                    <div className="clientsList" style={{
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '6px',
                        padding: '8px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        marginBottom: '12px'
                    }}>
                        {clients.map((client) => (
                            <Client key={client.socketId} username={client.username} />
                        ))}
                    </div>
                </div>

                <button
                    className="leaveBtn"
                    onClick={leaveRoom}
                    style={{
                        background: 'rgba(255, 59, 48, 0.8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '12px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        width: '100%',
                        marginTop: '10px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                        <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 17L21 12L16 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 12H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Leave Room
                </button>
            </div>

            <div className="editorWrap">
                <Editor
                    socketRef={stableSocketRef}
                    roomId={roomId}
                    onCodeChange={handleCodeChange}
                />
            </div>
        </div>
    );
};

export default EditorPage;