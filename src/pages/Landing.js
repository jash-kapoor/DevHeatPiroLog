import React from 'react';
import { useNavigate } from 'react-router-dom';
// import './Landing.css'; // Ensure this file exists for styling

const Landing = () => {
    const navigate = useNavigate();

    const handleNavigation = () => {
        navigate('/Home'); // Navigates to the Home page
    };

    return (
        <div className="landing-container">
           
            <h1 className='mytext'>Unlock Collaboration</h1>
           
            <div className="cards-container">
                <div className="card">
                    <img src="https://img.icons8.com/fluency/96/source-code.png" alt="Icon 1" />
                    <h3>Real-time Editing</h3>
                    <p>Edit documents together seamlessly.</p>
                </div>
                <div className="card">
                    <img src="https://img.icons8.com/fluency/96/feedback.png" alt="Icon 2" />
                    <h3>Code Review Made Easy</h3>
                    <p>Instantly review on your teammate’s code.</p>
                </div>
                <div className="card">
                    <img src="https://img.icons8.com/fluency/96/lock.png" alt="Icon 3" />
                    <h3>Encrypted Sessions</h3>
                    <p>Room where your code stay's private.</p>
                </div>
                <div className="card">
                    <img src="https://img.icons8.com/3d-fluency/94/cursor.png" alt="Icon 4" />
                    <h3> Live Cursor Sync</h3>
                    <p>Never lose track of who's editing.</p>
                </div>
            </div>
            <button className='custom-button' onClick={handleNavigation}>Let's Code</button>
        </div>
    );
};

export default Landing;
