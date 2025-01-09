import React from "react";
import { Link } from "react-router-dom";
import "./css/LandingPage.css"; // Add custom styles here

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1>Welcome to Your App</h1>
        <p>Manage your goals, events, attendance, and more all in one place.</p>
        <div className="cta-buttons">
          <Link to="/login" className="btn btn-primary">Login</Link>
          <Link to="/signup" className="btn btn-secondary">Sign Up</Link>
        </div>
      </header>

      <main className="landing-content">
        <section className="features">
          <h2>Features</h2>
          <div className="feature-list">
            <div className="feature-item">
              <h3>Dashboard</h3>
              <p>Get an overview of your goals, events, and progress.</p>
              <Link to="/dashboard" className="btn btn-outline-primary">Go to Dashboard</Link>
            </div>
            <div className="feature-item">
              <h3>Goals Management</h3>
              <p>Track and achieve your personal goals effortlessly.</p>
              <Link to="/points" className="btn btn-outline-primary">Manage Goals</Link>
            </div>
            <div className="feature-item">
              <h3>Events</h3>
              <p>Stay updated with upcoming events and activities.</p>
              <Link to="/events" className="btn btn-outline-primary">View Events</Link>
            </div>
            <div className="feature-item">
              <h3>Attendance</h3>
              <p>Track your attendance and ensure active participation.</p>
              <Link to="/attendance" className="btn btn-outline-primary">Check Attendance</Link>
            </div>
            <div className="feature-item">
              <h3>Leaderboard</h3>
              <p>See how you rank among others based on your achievements.</p>
              <Link to="/leaderboard" className="btn btn-outline-primary">View Leaderboard</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; 2024 AURASPHERE. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
