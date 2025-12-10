import React from 'react';
import UserProfile from '../components/Personalization/UserProfile';
import './ProfilePage.css'; // Create this CSS file for page-level styling

const ProfilePage = () => {
  return (
    <div className="profile-page">
      <header className="profile-page-header">
        <h1>User Profile & Preferences</h1>
        <p>Customize your experience with the Physical AI & Humanoid Robotics book</p>
      </header>
      
      <main className="profile-page-main">
        <div className="profile-container">
          <UserProfile />
        </div>
      </main>
      
      <footer className="profile-page-footer">
        <p>Your preferences are stored locally in your browser and never leave your device.</p>
        <p>All customizations comply with privacy and constitutional safety requirements.</p>
      </footer>
    </div>
  );
};

export default ProfilePage;