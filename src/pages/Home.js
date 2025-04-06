import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const createNewRoom = (e) => {
        e.preventDefault(); // prevent default to avoid page reload if used inside <form>
        const id = uuidV4();
        setRoomId(id);
        toast.success('Created a new room');
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('ROOM ID & username is required');
            return;
        }

        navigate(`/editor/${roomId}`, {
            state: {
                username,
            },
        });
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };

    return (
        <div className="homePageWrapper">
            <h2 className='hlyo'>From Solo to Synergy – Code With Your Team Instantly!</h2>
            <div className="formWrapper">
                <h3 style={{ fontFamily: 'Exodar' }} className='uniquename'>CODE COLLABRATION</h3>
                <div className="inputGroup">
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="ROOM ID"
                        onChange={(e) => setRoomId(e.target.value)}
                        value={roomId}
                        onKeyUp={handleInputEnter}
                    />
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="USERNAME"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        onKeyUp={handleInputEnter}
                    />
                    <button className="btn joinBtn" onClick={joinRoom}>
                        Join
                    </button>
                    <span className="createInfo">
                        Let's Increase The Synergy&nbsp;
                        <button
                            onClick={createNewRoom}
                            className="createNewBtn"
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#4dabf7',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontSize: 'inherit',
                                padding: 0
                            }}
                        >
                            Room Id
                        </button>
                    </span>
                </div>
            </div>
            <footer>
                <h4>
                    <a href="https://github.com/Tanmay1822" target="_blank" rel="noopener noreferrer">- PIROLOG</a>
                </h4>
            </footer>
        </div>
    );
};

export default Home;
