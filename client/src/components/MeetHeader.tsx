import React from 'react';
import './MeetHeader.css';

const MeetHeader: React.FC = () => {
  return (
    <header className="meet-header">
      <div className="header-left">
        <div className="logo-container">
          <span className="blue">M</span>
          <span className="red">e</span>
          <span className="yellow">e</span>
          <span className="blue">t</span>
          <span className="meet-text">Now</span>
        </div>
      </div>
      <div className="header-right">
        <button className="header-icon-button">
          <span className="material-icons">account_circle</span>
        </button>
      </div>
    </header>
  );
};

export default MeetHeader;