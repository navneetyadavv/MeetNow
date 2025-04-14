import React from 'react';
import './Home.css';

import MeetHeader from '../components/MeetHeader';
import MeetHero from '../components/MeetHero';
const Home: React.FC = () => {
  return (
    <div className="meet-app">
      <MeetHeader />
      <main>
        <MeetHero />
      </main>
    </div>
  );
};

export default Home;