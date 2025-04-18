// UserProfile.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import './UserProfile.css';

const UserProfile: React.FC = () => {
  const { currentUser, signOut } = useAuth();

  if (!currentUser) {
    return (
      <button onClick={() => window.location.href = '/login'} className="sign-in-button">
        Sign In
      </button>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-dropdown">
        <img 
          src={currentUser.photoURL || 'https://via.placeholder.com/40'} 
          alt="Profile" 
          className="profile-picture"
        />
        <div className="dropdown-content">
          <div className="user-info">
            <p className="user-name">{currentUser.displayName || 'User'}</p>
            <p className="user-email">{currentUser.email}</p>
          </div>
          <button onClick={signOut} className="sign-out-button">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;