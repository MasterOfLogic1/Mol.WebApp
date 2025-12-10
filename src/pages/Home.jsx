import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import molAnime from '../assets/mol-anime.png';

function Home() {
  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-left">
            <h1 className="hero-title">Learn, Build & Integrate</h1>
            <p className="hero-description">
            Intelligent Automation ▪︎ RPA ▪︎ AI ▪︎ Programming
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="hero-btn-primary">Get Started</Link>
              <Link to="/courses" className="hero-btn-secondary">
                <span className="play-icon">▶</span>
                Go to Courses
              </Link>
            </div>
          </div>
          <div className="hero-right">
            <img src={molAnime} alt="Master of Logic" className="hero-image" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

