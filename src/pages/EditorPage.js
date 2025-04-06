import React, { useState, useRef, useEffect, useCallback } from 'react';
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

    const handleErrors = useCallback((e) => {
        console.error('Socket error:', e);
        toast.error('Socket connection failed, try again later.');
        reactNavigator('/');
    }, [reactNavigator]);

    const handleCodeChange = useCallback((code) => {
        codeRef.current = code;
    }, []);

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

                // Store references for cleanup
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
                    // Use same references for cleanup
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
            if (socketRef.current?.connected) {
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
                {/* Your existing sidebar JSX remains identical */}
                <div className="asideInner">
                    {/* Logo section */}
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

                    {/* Room info section */}
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
                                    {/* Your SVG path data remains the same */}
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

                    {/* Collaborators list */}
                    <h3 style={{
                        margin: '0 0 12px 0',
                        fontSize: '18px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                            {/* Your SVG path data remains the same */}
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

                {/* Leave button */}
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
                        {/* Your SVG path data remains the same */}
                    </svg>
                    Leave Room
                </button>
            </div>

            {/* Editor component */}
            <div className="editorWrap">
                <Editor
                    socketRef={socketRef}
                    roomId={roomId}
                    onCodeChange={handleCodeChange}
                />
            </div>
        </div>
    );
};

export default EditorPage;