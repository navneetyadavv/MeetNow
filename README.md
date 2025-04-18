# Video Conferencing Application

A real-time video conferencing application built with React, Socket.IO, and PeerJS. This application allows users to create or join rooms, share screens, send chat messages, and manage audio/video settings.

## Features

- **Real-time Video Conferencing**: Join or create rooms for video calls.
- **Screen Sharing**: Share your screen with other participants.
- **Chat Functionality**: Send and receive messages in real-time.
- **Audio/Video Controls**: Toggle audio and video settings during the call.
- **Responsive Design**: Optimized for both desktop and mobile views.
- **Active Speaker Detection**: Highlight the active speaker in the meeting.

## Technologies Used

- **Frontend**: 
  - React
  - Socket.IO Client
  - PeerJS
- **Backend**: 
  - Node.js
  - Socket.IO Server
- **Styling**: 
  - CSS

## Installation

1. Clone the repository:
   ```bash
   https://github.com/navneetyadavv/MeetNow.git
   # Navigate to the client directory

2. Install dependencies for both client and server:
   # Navigate to the client directory
   cd client
   npm install

   # Navigate to the server directory
   cd server
   npm install

3. Set up environment variables:
   VITE_WS_SERVER=http://localhost:8000
   
4. Start the server and client:
   # In the server directory
     npm start
   # In the client directory
     npm start


