import React from "react";
import "./MeetHero.css";
import { CreateButton } from "./CreateButton";
import { JoinButton } from "./JoinButton";

const MeetHero: React.FC = () => {
  return (
    <section className="meet-hero">
      <div className="hero-background"></div>
      <div className="hero-container">
        <div className="hero-content">
          <h1>
            <span className="highlight">Premium</span> video meetings.
            <br />
            Now free for everyone.
          </h1>
          <p className="hero-subtitle">
            We re-engineered the service we built for secure business meetings,
            <br />
            Google Meet, to make it free and available for all.
          </p>
          <div className="hero-actions">
            <CreateButton />
            <JoinButton/>
          </div>
        </div>
        <div className="hero-image">
          <div className="people-container">
            <div className="person person1">
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="Person 1"
                className="person-image"
              />
            </div>
            <div className="person person2">
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="Person 2"
                className="person-image"
              />
            </div>
            <div className="person person3">
              <img
                src="https://randomuser.me/api/portraits/women/68.jpg"
                alt="Person 3"
                className="person-image"
              />
            </div>
            <div className="person person4">
              <img
                src="https://randomuser.me/api/portraits/men/75.jpg"
                alt="Person 4"
                className="person-image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetHero;
