import React, { useState, useEffect } from 'react';

const UserProfile = () => {
  const [userPreferences, setUserPreferences] = useState({
    readingLevel: 'intermediate',
    theme: 'light',
    language: 'en',
    notifications: true,
    safetyMode: 'strict',  // Options: 'strict', 'balanced', 'relaxed'
    personalization: true
  });

  // Load preferences from localStorage on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));

    // Apply theme to the document
    document.documentElement.setAttribute('data-theme', userPreferences.theme);
  }, [userPreferences]);

  const handlePreferenceChange = (key, value) => {
    setUserPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetToDefaults = () => {
    const defaultPreferences = {
      readingLevel: 'intermediate',
      theme: 'light',
      language: 'en',
      notifications: true,
      safetyMode: 'strict',
      personalization: true
    };
    setUserPreferences(defaultPreferences);
  };

  return (
    <div className="user-profile-container">
      <h2>User Preferences & Profile</h2>

      <div className="preference-section">
        <h3>Reading Preferences</h3>
        <div className="preference-item">
          <label htmlFor="reading-level">Reading Level:</label>
          <select
            id="reading-level"
            value={userPreferences.readingLevel}
            onChange={(e) => handlePreferenceChange('readingLevel', e.target.value)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div className="preference-section">
        <h3>Display Settings</h3>
        <div className="preference-item">
          <label htmlFor="theme">Theme:</label>
          <select
            id="theme"
            value={userPreferences.theme}
            onChange={(e) => handlePreferenceChange('theme', e.target.value)}
          >
            <option value="light">Light Default</option>
            <option value="light-blue">Light Blue</option>
            <option value="light-green">Light Green</option>
            <option value="light-purple">Light Purple</option>
            <option value="dark">Dark Default</option>
            <option value="dark-blue">Dark Blue</option>
            <option value="dark-green">Dark Green</option>
          </select>
        </div>

        <div className="preference-item">
          <label htmlFor="language">Language:</label>
          <select
            id="language"
            value={userPreferences.language}
            onChange={(e) => handlePreferenceChange('language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="ur">Urdu</option>
          </select>
        </div>
      </div>

      <div className="preference-section">
        <h3>Safety Settings</h3>
        <div className="preference-item">
          <label htmlFor="safety-mode">Safety Mode:</label>
          <select
            id="safety-mode"
            value={userPreferences.safetyMode}
            onChange={(e) => handlePreferenceChange('safetyMode', e.target.value)}
          >
            <option value="strict">Strict (Maximum Safety)</option>
            <option value="balanced">Balanced</option>
            <option value="relaxed">Relaxed (More Flexibility)</option>
          </select>
          <p className="safety-description">
            {userPreferences.safetyMode === 'strict' && 'Strict mode enforces maximum safety protocols and conservative responses.'}
            {userPreferences.safetyMode === 'balanced' && 'Balanced mode maintains safety while allowing more comprehensive responses.'}
            {userPreferences.safetyMode === 'relaxed' && 'Relaxed mode prioritizes functionality while maintaining basic safety protocols.'}
          </p>
        </div>
      </div>

      <div className="preference-section">
        <h3>Features</h3>
        <div className="preference-item checkbox-item">
          <label>
            <input
              type="checkbox"
              checked={userPreferences.notifications}
              onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
            />
            Enable notifications
          </label>
        </div>

        <div className="preference-item checkbox-item">
          <label>
            <input
              type="checkbox"
              checked={userPreferences.personalization}
              onChange={(e) => handlePreferenceChange('personalization', e.target.checked)}
            />
            Enable personalization
          </label>
          <p className="description">Personalize content based on your preferences and reading history</p>
        </div>
      </div>

      <div className="preference-actions">
        <button onClick={resetToDefaults} className="reset-button">
          Reset to Defaults
        </button>
        <div className="constitutional-compliance">
          <p><strong>Constitutional Compliance:</strong> All settings respect the Physical-AI-Humanoid-Robotic Constitution safety principles.</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;