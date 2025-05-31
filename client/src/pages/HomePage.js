import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // import the css

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage-container">
      <h1 className='homepage_heading'>
        <span className='sub_heading'>T</span>ic 
        <span className='sub_heading'>T</span>ac 
        <span className='sub_heading'>T</span>oe
      </h1>
      <p className='homepage_para'>Play with friends in real-time. Create or join a game room!</p>
      <button
        className="homepage-button"
        onClick={() => navigate('/game')}
      >
        START
      </button>
    </div>
  );
}

export default HomePage;
